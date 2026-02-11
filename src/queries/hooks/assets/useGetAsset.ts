'use client';

import type { AssetData } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { Asset } from '@/entities';
import { assetKeys } from '@/queries/keys';

export function useGetAsset(locale: string, assetId: number | null | undefined) {
  return useQuery({
    queryKey: assetKeys.detail(assetId ?? 0),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/assets/${assetId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch asset');
      }
      const { asset } = (await res.json()) as { asset: AssetData };
      return Asset.fromApi(asset);
    },
    enabled: typeof assetId === 'number' && assetId > 0,
  });
}
