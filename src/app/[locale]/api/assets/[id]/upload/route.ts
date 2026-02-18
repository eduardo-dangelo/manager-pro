import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { currentUser } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { AssetService } from '@/services/assetService';

const GALLERY_ACCEPT = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const DOCS_ACCEPT = ['application/pdf'];
const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5 MB (Vercel Blob server limit)

const UPLOADS_DIR = 'public/uploads';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
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

    const asset = await AssetService.getAssetById(assetId, user.id);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing file or type (docs | gallery)' },
        { status: 400 },
      );
    }

    if (type !== 'docs' && type !== 'gallery') {
      return NextResponse.json(
        { error: 'Invalid type. Must be docs or gallery' },
        { status: 400 },
      );
    }

    const mimeType = file.type;
    const size = file.size;

    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4.5 MB' },
        { status: 400 },
      );
    }

    if (type === 'docs') {
      if (!DOCS_ACCEPT.includes(mimeType)) {
        return NextResponse.json(
          { error: 'Invalid file type. Docs accept PDF only' },
          { status: 400 },
        );
      }
    } else if (type === 'gallery') {
      if (!GALLERY_ACCEPT.includes(mimeType)) {
        return NextResponse.json(
          { error: 'Invalid file type. Gallery accepts PNG, JPG, GIF, WebP only' },
          { status: 400 },
        );
      }
    }

    const ext = type === 'docs' ? 'pdf' : mimeType.split('/')[1] || 'bin';
    const fileId = randomUUID();
    const pathname = `assets/${assetId}/${type}/${fileId}.${ext}`;
    const name = file.name || `file.${ext}`;

    let url: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(pathname, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      url = blob.url;
      logger.info('File uploaded', { assetId, type, pathname });
    } else {
      // Local fallback: store in public/uploads/ (works without Vercel Blob token)
      const dir = path.join(process.cwd(), UPLOADS_DIR, path.dirname(pathname));
      await mkdir(dir, { recursive: true });
      const filePath = path.join(process.cwd(), UPLOADS_DIR, pathname);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      // public/ is served at root, so public/uploads/... → /uploads/...
      url = `/uploads/${pathname}`;
      logger.info('File uploaded (local)', { assetId, type, pathname });
    }

    return NextResponse.json({
      id: fileId,
      name,
      url,
      size,
      mimeType,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error uploading file: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
