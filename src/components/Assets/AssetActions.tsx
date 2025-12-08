'use client';

import { DropdownButton } from '@/components/common/DropdownButton';

type AssetActionsProps = {
  assetId: number;
  locale: string;
  onDeleted?: () => void;
  onCompleted?: () => void;
};

export function AssetActions({ assetId, locale, onDeleted, onCompleted }: AssetActionsProps) {
  const markComplete = async () => {
    try {
      await fetch(`/${locale}/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      onCompleted?.();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAsset = async () => {
    try {
      await fetch(`/${locale}/api/assets/${assetId}`, { method: 'DELETE' });
      onDeleted?.();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DropdownButton
      options={[
        {
          label: 'Mark as complete',
          onClick: markComplete,
        },
        {
          label: 'Delete',
          onClick: deleteAsset,
          sx: { color: 'error.main' },
        },
      ]}
      tooltip="Asset actions"
    />
  );
}

