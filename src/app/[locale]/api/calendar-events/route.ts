import type { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { CalendarEventService } from '@/services/calendarEventService';
import { CalendarEventValidation } from '@/validations/CalendarEventValidation';

export const GET = async (request: NextRequest) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetIdParam = searchParams.get('assetId');
    let assetId: number | null = null;
    if (assetIdParam != null && assetIdParam !== '') {
      const parsed = Number.parseInt(assetIdParam, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return NextResponse.json({ error: 'Invalid assetId' }, { status: 400 });
      }
      assetId = parsed;
    }

    const events = assetId !== null
      ? await CalendarEventService.getByAssetId(assetId, user.id)
      : await CalendarEventService.getByUserId(user.id);

    return NextResponse.json({ events });
  } catch (error: unknown) {
    logger.error(`Error fetching calendar events: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const parse = CalendarEventValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const eventData = {
      assetId: parse.data.assetId,
      name: parse.data.name,
      description: parse.data.description ?? null,
      location: parse.data.location ?? null,
      color: parse.data.color ?? null,
      start: new Date(parse.data.start),
      end: new Date(parse.data.end),
    };

    const event = await CalendarEventService.create(eventData, user.id);
    if (!event) {
      throw new Error('Failed to create calendar event');
    }

    logger.info('Calendar event created', { eventId: event.id });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Error creating calendar event: ${msg}`);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 },
    );
  }
};
