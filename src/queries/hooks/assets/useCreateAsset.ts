'use client';

import type { AssetData } from '@/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Asset } from '@/entities';
import { assetKeys } from '@/queries/keys';

export type CreateAssetInput = {
  name?: string;
  description?: string;
  color?: string;
  status?: string;
  type: string;
  registrationNumber?: string;
  address?: string;
  metadata?: Record<string, unknown>;
};

export function useCreateAsset(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAssetInput) => {
      const res = await fetch(`/${locale}/api/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create asset');
      }
      const { asset } = (await res.json()) as { asset: AssetData };
      return Asset.fromApi(asset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}
