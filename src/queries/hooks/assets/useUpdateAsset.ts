'use client';

import type { AssetData } from '@/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Asset } from '@/entities';
import { activityKeys, assetKeys } from '@/queries/keys';

export type UpdateAssetInput = Partial<{
  name: string;
  description: string;
  color: string;
  status: string;
  tabs: string[];
  registrationNumber: string;
  address: string;
  metadata: Record<string, unknown>;
  activityAction: string;
  activityMetadata: Record<string, unknown>;
  skipActivityLog: boolean;
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
    onMutate: async (variables) => {
      const queryKey = assetKeys.detail(assetId);
      const previousAsset = queryClient.getQueryData(queryKey) as Asset | undefined;
      if (previousAsset) {
        const { activityAction, activityMetadata, skipActivityLog, ...assetUpdates } = variables;
        const mergedData = { ...previousAsset.data, ...assetUpdates } as AssetData;
        queryClient.setQueryData(queryKey, Asset.fromApi(mergedData));
      }
      return { previousAsset };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousAsset !== undefined) {
        queryClient.setQueryData(assetKeys.detail(assetId), context.previousAsset);
      }
    },
    onSuccess: (updatedAsset) => {
      queryClient.setQueryData(assetKeys.detail(assetId), updatedAsset);
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      queryClient.invalidateQueries({ queryKey: activityKeys.list({ assetId }) });
    },
  });
}
