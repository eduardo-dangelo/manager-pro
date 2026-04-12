import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { ActivityService } from '@/services/activityService';
import { AssetService } from '@/services/assetService';
import { UpdateAssetValidation } from '@/validations/AssetValidation';

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
    const assetId = Number.parseInt(id, 10);

    if (Number.isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    const asset = await AssetService.getAssetWithRelations(assetId, user.id);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    logger.error(`Error fetching asset: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
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
    const assetId = Number.parseInt(id, 10);

    if (Number.isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    const json = await request.json();

    // Extract activity override params (not part of asset schema)
    const activityAction = json.activityAction as string | undefined;
    const activityMetadata = json.activityMetadata as Record<string, unknown> | undefined;
    const skipActivityLog = json.skipActivityLog as boolean | undefined;

    const assetData = { ...json };
    delete assetData.activityAction;
    delete assetData.activityMetadata;
    delete assetData.skipActivityLog;

    const parse = UpdateAssetValidation.safeParse(assetData);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    // Check if type is being changed when it's already set (type comes from raw json, not validated)
    const requestedType = json.type as string | undefined;
    if (requestedType !== undefined) {
      const existingAsset = await AssetService.getAssetById(assetId, user.id);
      if (existingAsset && existingAsset.type && existingAsset.type !== requestedType) {
        return NextResponse.json(
          { error: 'Asset type cannot be changed once set' },
          { status: 400 },
        );
      }
    }

    const asset = await AssetService.updateAsset(assetId, parse.data, user.id);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (!skipActivityLog) {
      if (activityAction && activityMetadata) {
        await ActivityService.create(
          {
            assetId: asset.id,
            action: activityAction as import('@/services/activityService').ActivityAction,
            metadata: activityMetadata,
          },
          user.id,
        );
      } else {
        await ActivityService.create(
          { assetId: asset.id, action: 'asset_updated' },
          user.id,
        );
      }
    }

    logger.info('Asset has been updated', { assetId: asset.id });

    return NextResponse.json({ asset });
  } catch (error) {
    logger.error(`Error updating asset: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to update asset' },
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
    const assetId = Number.parseInt(id, 10);

    if (Number.isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    await AssetService.deleteAsset(assetId, user.id);

    logger.info('Asset has been deleted', { assetId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting asset: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 },
    );
  }
};
