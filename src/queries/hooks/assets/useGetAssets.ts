'use client';

import type { AssetData } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { Asset } from '@/entities';
import { assetKeys } from '@/queries/keys';

export function useGetAssets(locale: string, filters?: { type?: string }) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/assets`);
      if (!res.ok) {
        throw new Error('Failed to fetch assets');
      }
      const { assets } = (await res.json()) as { assets: AssetData[] };
      return (assets ?? []).map((a: AssetData) => Asset.fromApi(a));
    },
  });
}
