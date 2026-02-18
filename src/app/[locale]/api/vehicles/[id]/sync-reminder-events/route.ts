import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { AssetService } from '@/services/assetService';
import { CalendarEventService } from '@/services/calendarEventService';

const MOT_REMINDER_MARKER = '[AUTO:vehicle_mot_reminder]';
const TAX_REMINDER_MARKER = '[AUTO:vehicle_tax_reminder]';
const REMINDER_COLOR = 'orange';

const MINUTES_PER_DAY = 24 * 60;
const VEHICLE_REMINDERS = {
  useDefault: false,
  overrides: [
    { method: 'popup' as const, minutes: 30 * MINUTES_PER_DAY },
    { method: 'popup' as const, minutes: 7 * MINUTES_PER_DAY },
    { method: 'popup' as const, minutes: MINUTES_PER_DAY },
  ],
};

function parseExpiryDate(value: string | undefined): Date | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getAllDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export const POST = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const assetId = Number.parseInt(id, 10);
    if (Number.isNaN(assetId) || assetId < 1) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    const asset = await AssetService.getAssetById(assetId, user.id);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (asset.type !== 'vehicle') {
      return NextResponse.json(
        { error: 'Asset is not a vehicle' },
        { status: 400 },
      );
    }

    const metadata = (asset.metadata as Record<string, unknown>) || {};
    const maintenance = (metadata.maintenance as Record<string, unknown>) || {};
    const mot = (maintenance.mot as Record<string, unknown>) || {};
    const tax = (maintenance.tax as Record<string, unknown>) || {};

    const motExpires = parseExpiryDate(mot.expires as string | undefined);
    const taxExpires = parseExpiryDate(tax.expires as string | undefined);

    if (!motExpires && !taxExpires) {
      return NextResponse.json({ synced: true, created: 0, updated: 0 });
    }

    const existingEvents = await CalendarEventService.getByAssetId(
      assetId,
      user.id,
    );

    const motEvent = existingEvents.find(
      e => e.description?.includes(MOT_REMINDER_MARKER),
    );
    const taxEvent = existingEvents.find(
      e => e.description?.includes(TAX_REMINDER_MARKER),
    );

    let created = 0;
    let updated = 0;

    if (motExpires) {
      const { start, end } = getAllDayRange(motExpires);
      if (motEvent) {
        const motEventId = motEvent.id;
        const existingStart = new Date(motEvent.start).getTime();
        const hasFullReminders
          = ((motEvent.reminders as { overrides?: unknown[] } | null)?.overrides?.length ?? 0) >= 3;
        if (existingStart !== start.getTime() || !hasFullReminders) {
          await CalendarEventService.update(
            motEventId,
            { start, end, reminders: VEHICLE_REMINDERS },
            user.id,
          );
          updated++;
        }
      } else {
        await CalendarEventService.create(
          {
            assetId,
            name: 'MOT Reminder',
            description: MOT_REMINDER_MARKER,
            color: REMINDER_COLOR,
            start,
            end,
            reminders: VEHICLE_REMINDERS,
          },
          user.id,
        );
        created++;
      }
    }

    if (taxExpires) {
      const { start, end } = getAllDayRange(taxExpires);
      if (taxEvent) {
        const taxEventId = taxEvent.id;
        const existingStart = new Date(taxEvent.start).getTime();
        const hasFullReminders
          = ((taxEvent.reminders as { overrides?: unknown[] } | null)?.overrides?.length ?? 0) >= 3;
        if (existingStart !== start.getTime() || !hasFullReminders) {
          await CalendarEventService.update(
            taxEventId,
            { start, end, reminders: VEHICLE_REMINDERS },
            user.id,
          );
          updated++;
        }
      } else {
        await CalendarEventService.create(
          {
            assetId,
            name: 'Tax Reminder',
            description: TAX_REMINDER_MARKER,
            color: REMINDER_COLOR,
            start,
            end,
            reminders: VEHICLE_REMINDERS,
          },
          user.id,
        );
        created++;
      }
    }

    // Add calendar tab if we created events and asset doesn't have it
    let updatedTabs: string[] | undefined;
    const currentTabs = (asset.tabs ?? ['overview']) as string[];
    if (created > 0 && !currentTabs.includes('calendar')) {
      const newTabs = [...currentTabs, 'calendar'];
      await AssetService.updateAsset(assetId, { tabs: newTabs }, user.id);
      updatedTabs = newTabs;
    }

    logger.info('Vehicle reminder events synced', {
      assetId,
      created,
      updated,
    });

    return NextResponse.json({
      synced: true,
      created,
      updated,
      ...(updatedTabs && { tabs: updatedTabs }),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Error syncing vehicle reminder events: ${msg}`);
    return NextResponse.json(
      { error: 'Failed to sync reminder events' },
      { status: 500 },
    );
  }
};
