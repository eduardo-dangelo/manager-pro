'use client';

import type { AssetData } from '@/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Asset } from '@/entities';
import { assetKeys } from '@/queries/keys';

export type UpdateAssetInput = Partial<{
  name: string;
  description: string;
  color: string;
  status: string;
  tabs: string[];
  registrationNumber: string;
  address: string;
  metadata: Record<string, unknown>;
}>;

export function useUpdateAsset(locale: string, assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAssetInput) => {
      const res = await fetch(`/${locale}/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update asset');
      }
      const { asset } = (await res.json()) as { asset: AssetData };
      return Asset.fromApi(asset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assetId) });
    },
  });
}
