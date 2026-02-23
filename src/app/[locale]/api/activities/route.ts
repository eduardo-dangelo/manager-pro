import type { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { ActivityService } from '@/services/activityService';

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

    const activities
      = assetId !== null
        ? await ActivityService.getByAssetId(assetId, user.id)
        : await ActivityService.getByUserId(user.id);

    return NextResponse.json({ activities });
  } catch (error: unknown) {
    logger.error(
      `Error fetching activities: ${error instanceof Error ? error.message : String(error)}`,
    );
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 },
    );
  }
};
