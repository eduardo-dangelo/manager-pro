import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { NotificationService } from '@/services/notificationService';

export const PATCH = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const notificationId = Number.parseInt(id, 10);

    if (Number.isNaN(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    const updated = await NotificationService.markAsRead(notificationId, user.id);

    if (!updated) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      notification: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    logger.error(
      `Error marking notification as read: ${error instanceof Error ? error.message : String(error)}`,
    );
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 },
    );
  }
};
