'use client';

import { useMemo } from 'react';
import type { AssetMediaItem, MediaKind } from './types';
import { normalizeDocsMetadata, normalizeGalleryMetadata } from '@/components/Assets/Asset/tabs/types';

export function useFilteredAssetsWithMedia(
  assets: AssetMediaItem[],
  mediaKind: MediaKind,
): AssetMediaItem[] {
  return useMemo(() => {
    return assets.filter((asset) => {
      if (mediaKind === 'docs') {
        return normalizeDocsMetadata(asset.metadata?.docs).files.length > 0;
      }
      return normalizeGalleryMetadata(asset.metadata?.gallery).files.length > 0;
    });
  }, [assets, mediaKind]);
}
