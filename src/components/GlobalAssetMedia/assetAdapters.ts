import type { AssetMediaItem } from './types';

export type AssetTabMediaValue = {
  id: number;
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
};

export function toAssetTabMediaValue(asset: AssetMediaItem): AssetTabMediaValue {
  return {
    id: asset.id,
    name: asset.name ?? '',
    description: asset.description ?? '',
    metadata: asset.metadata as Record<string, unknown> | undefined,
  };
}
