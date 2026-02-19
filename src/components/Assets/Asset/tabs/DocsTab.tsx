'use client';

import { DocsTabContent } from './docs';

type Asset = {
  id: number;
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
};

type DocsTabProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset?: (updates: Partial<Asset>) => void;
};

export function DocsTab({ asset, locale, onUpdateAsset: _onUpdateAsset }: DocsTabProps) {
  return <DocsTabContent asset={asset} locale={locale} />;
}
