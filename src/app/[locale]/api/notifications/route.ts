import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { NotificationService } from '@/services/notificationService';

export const GET = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await NotificationService.getByUserId(user.id);

    return NextResponse.json({ notifications });
  } catch (error: unknown) {
    logger.error(
      `Error fetching notifications: ${error instanceof Error ? error.message : String(error)}`,
    );
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 },
    );
  }
};
