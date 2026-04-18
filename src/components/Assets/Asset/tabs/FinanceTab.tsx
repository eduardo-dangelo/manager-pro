'use client';

import { FinancePageView } from '@/components/Finance/FinancePageView';

type Asset = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  type?: string | null;
};

type FinanceTabProps = {
  asset: Asset;
  locale: string;
};

export function FinanceTab({ asset, locale }: FinanceTabProps) {
  return (
    <FinancePageView
      locale={locale}
      assetId={asset.id}
      assetName={asset.name ?? undefined}
      assetType={asset.type ?? undefined}
    />
  );
}
