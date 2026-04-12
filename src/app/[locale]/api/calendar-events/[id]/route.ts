import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { ActivityService } from '@/services/activityService';
import { AssetService } from '@/services/assetService';
import { CalendarEventService } from '@/services/calendarEventService';
import { UpdateCalendarEventValidation } from '@/validations/CalendarEventValidation';

export const GET = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const eventId = Number.parseInt(id, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await CalendarEventService.getById(eventId, user.id);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: unknown) {
    logger.error(`Error fetching calendar event: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to fetch calendar event' },
      { status: 500 },
    );
  }
};

export const PUT = async (
  request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const eventId = Number.parseInt(id, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateCalendarEventValidation.safeParse({ ...json, id: eventId });

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const existingEvent = await CalendarEventService.getById(eventId, user.id);
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (parse.data.name !== undefined) {
      updates.name = parse.data.name;
    }
    if (parse.data.description !== undefined) {
      updates.description = parse.data.description;
    }
    if (parse.data.location !== undefined) {
      updates.location = parse.data.location;
    }
    if (parse.data.color !== undefined) {
      updates.color = parse.data.color;
    }
    if (parse.data.assetId !== undefined) {
      updates.assetId = parse.data.assetId;
    }
    if (parse.data.start !== undefined) {
      updates.start = new Date(parse.data.start);
    }
    if (parse.data.end !== undefined) {
      updates.end = new Date(parse.data.end);
    }
    if (parse.data.reminders !== undefined) {
      updates.reminders = parse.data.reminders;
    }

    const event = await CalendarEventService.update(
      eventId,
      updates as Parameters<typeof CalendarEventService.update>[1],
      user.id,
    );

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const activityMetadata: Record<string, unknown> = {
      eventName: event.name,
      eventColor: event.color ?? null,
    };
    if (parse.data.name !== undefined && existingEvent.name !== parse.data.name) {
      activityMetadata.changeType = 'renamed';
      activityMetadata.oldName = existingEvent.name;
      activityMetadata.newName = parse.data.name;
    } else if (parse.data.start !== undefined) {
      const oldStart = new Date(existingEvent.start).toISOString();
      const newStart = new Date(parse.data.start).toISOString();
      if (oldStart !== newStart) {
        activityMetadata.changeType = 'start_time_changed';
        activityMetadata.oldStart = oldStart;
        activityMetadata.newStart = newStart;
      }
    }
    if (parse.data.end !== undefined && !activityMetadata.changeType) {
      const oldEnd = new Date(existingEvent.end).toISOString();
      const newEnd = new Date(parse.data.end).toISOString();
      if (oldEnd !== newEnd) {
        activityMetadata.changeType = 'end_time_changed';
        activityMetadata.oldEnd = oldEnd;
        activityMetadata.newEnd = newEnd;
      }
    }
    if (parse.data.description !== undefined && existingEvent.description !== parse.data.description && !activityMetadata.changeType) {
      activityMetadata.changeType = 'description_changed';
      activityMetadata.oldDescription = existingEvent.description ?? '';
      activityMetadata.newDescription = parse.data.description ?? '';
    }
    if (parse.data.location !== undefined && existingEvent.location !== parse.data.location && !activityMetadata.changeType) {
      activityMetadata.changeType = 'location_changed';
      activityMetadata.oldLocation = existingEvent.location ?? '';
      activityMetadata.newLocation = parse.data.location ?? '';
    }
    if (parse.data.color !== undefined && existingEvent.color !== parse.data.color && !activityMetadata.changeType) {
      activityMetadata.changeType = 'color_changed';
      activityMetadata.oldColor = existingEvent.color ?? '';
      activityMetadata.newColor = parse.data.color ?? '';
    }
    if (parse.data.assetId !== undefined && existingEvent.assetId !== parse.data.assetId && !activityMetadata.changeType) {
      activityMetadata.changeType = 'asset_changed';
      activityMetadata.oldAssetId = existingEvent.assetId;
      activityMetadata.newAssetId = parse.data.assetId;
      const [oldAsset, newAsset] = await Promise.all([
        existingEvent.assetId ? AssetService.getAssetById(existingEvent.assetId, user.id) : null,
        parse.data.assetId ? AssetService.getAssetById(parse.data.assetId, user.id) : null,
      ]);
      activityMetadata.oldAssetName = oldAsset?.name ?? '';
      activityMetadata.newAssetName = newAsset?.name ?? '';
    }

    await ActivityService.create(
      {
        assetId: event.assetId,
        action: 'event_updated',
        entityType: 'calendar_event',
        entityId: event.id,
        metadata: activityMetadata,
      },
      user.id,
    );

    if (parse.data.reminders !== undefined) {
      const oldOverrides = (existingEvent.reminders as { overrides?: { minutes: number }[] } | null)?.overrides ?? [];
      const newOverrides = parse.data.reminders.overrides ?? [];
      const oldMinutes = [...oldOverrides].map(o => o.minutes).sort((a, b) => a - b).join(',');
      const newMinutes = [...newOverrides].map(o => o.minutes).sort((a, b) => a - b).join(',');
      const remindersChanged = oldMinutes !== newMinutes && newOverrides.length > 0;
      if (remindersChanged) {
        await ActivityService.create(
          {
            assetId: event.assetId,
            action: 'event_reminder_added',
            entityType: 'calendar_event',
            entityId: event.id,
            metadata: {
              eventName: event.name,
              eventColor: event.color ?? null,
              reminderMinutes: newOverrides.map(o => o.minutes),
            },
          },
          user.id,
        );
      }
    }

    logger.info('Calendar event updated', { eventId: event.id });

    return NextResponse.json({ event });
  } catch (error: unknown) {
    logger.error(`Error updating calendar event: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const eventId = Number.parseInt(id, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await CalendarEventService.getById(eventId, user.id);
    if (event) {
      await ActivityService.create(
        {
          assetId: event.assetId,
          action: 'event_deleted',
          entityType: 'calendar_event',
          entityId: event.id,
          metadata: {
            eventName: event.name,
            eventColor: event.color ?? null,
          },
        },
        user.id,
      );
    }

    await CalendarEventService.delete(eventId, user.id);

    logger.info('Calendar event deleted', { eventId });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error(`Error deleting calendar event: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 },
    );
  }
};
