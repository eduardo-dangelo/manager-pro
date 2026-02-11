import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { AssetService } from '@/services/assetService';
import { AssetValidation } from '@/validations/AssetValidation';

export const GET = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assets = await AssetService.getAssetsByUserId(user.id);

    return NextResponse.json({ assets });
  } catch (error) {
    logger.error(`Error fetching assets: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Full fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
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

    // Sync user with database to ensure userId foreign key constraint is satisfied
    const { UserService } = await import('@/services/userService');
    await UserService.upsertUser({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });

    const json = await request.json();
    const parse = AssetValidation.safeParse(json);
    console.error('parse', parse);
    console.error('json', json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const asset = await AssetService.createAsset(parse.data, user.id);

    if (!asset) {
      throw new Error('Failed to create asset - no asset returned');
    }

    logger.info('Asset has been created', { assetId: asset.id });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    logger.error(`Error creating asset: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Full error details:', error);
    return NextResponse.json(
      { error: 'Failed to create asset', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
};
