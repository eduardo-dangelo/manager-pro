'use client';

import type { FilePreviewItem } from '@/components/Assets/Asset/tabs/FilePreviewPopover';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetKeys } from '@/queries/keys';

export type UploadAssetFileInput = {
  file: File;
  type: 'docs' | 'gallery';
};

export function useUploadAssetFile(locale: string, assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, type }: UploadAssetFileInput) => {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('type', type);

      const res = await fetch(`/${locale}/api/assets/${assetId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Upload failed');
      }

      return (await res.json()) as FilePreviewItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assetId) });
    },
  });
}
