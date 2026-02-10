import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { CalendarEventService } from '@/services/calendarEventService';
import { NotificationService } from '@/services/notificationService';

const CRON_SECRET = process.env.CRON_SECRET;
const GRACE_MS = 60 * 60 * 1000; // 1 hour

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    const authHeader = request.headers.get('authorization');
    const secret = authHeader?.replace(/^Bearer\s+/i, '') ?? request.nextUrl.searchParams.get('secret');
    if (!CRON_SECRET || secret !== CRON_SECRET) {
      if (process.env.NODE_ENV === 'production' && !CRON_SECRET) {
        logger.warn('Event reminder cron: CRON_SECRET is not set; reminders are disabled until it is set in the Vercel project.');
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (!CRON_SECRET || request.nextUrl.searchParams.get('secret') !== CRON_SECRET) {
    logger.info('Event reminder cron running without auth (development only).');
  }

  try {
    const now = new Date();
    const startAfter = new Date(now.getTime() - GRACE_MS);
    const events = await CalendarEventService.getEventsWithReminders(startAfter);
    let created = 0;

    for (const event of events) {
      const reminders = event.reminders as { useDefault: boolean; overrides: { method: string; minutes: number }[] } | null;
      if (!reminders?.overrides?.length) continue;

      const eventStart = new Date(event.start);
      if (eventStart.getTime() < now.getTime() - GRACE_MS) continue;

      for (const override of reminders.overrides) {
        const triggerTime = new Date(eventStart.getTime() - override.minutes * 60 * 1000);
        if (now.getTime() < triggerTime.getTime()) continue;

        const alreadySent = await NotificationService.existsEventReminder(
          event.userId,
          event.id,
          override.minutes,
        );
        if (alreadySent) continue;

        const title = `Reminder: "${event.name}" in ${override.minutes} minutes`;
        await NotificationService.create({
          userId: event.userId,
          type: 'event_reminder',
          title,
          metadata: {
            type: 'event_reminder',
            eventId: event.id,
            eventName: event.name,
            eventStart: typeof event.start === 'string' ? event.start : new Date(event.start).toISOString(),
            reminderMinutes: override.minutes,
            assetId: event.assetId,
          },
        });
        created++;
        logger.info('Event reminder notification created', {
          eventId: event.id,
          userId: event.userId,
          minutes: override.minutes,
        });
      }
    }

    return NextResponse.json({ ok: true, created });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Error checking event reminders: ${msg}`);
    return NextResponse.json({ error: 'Failed to check reminders' }, { status: 500 });
  }
}
