'use client';

import { AssetFolderView } from '@/components/Assets/Views/AssetFolderView';
import { AssetListView } from '@/components/Assets/Views/AssetListView';

type Asset = {
  id: number;
  name: string | null;
  description: string;
  color: string;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  registrationNumber?: string | null;
  metadata?: {
    specs?: {
      registration?: string;
    };
  } | null;
};

type ViewMode = 'folder' | 'list';
type CardSize = 'small' | 'medium' | 'large';
type SortBy = 'dateCreated' | 'dateModified' | 'name' | 'type' | 'status';

type AssetsListProps = {
  assets: Asset[];
  locale: string;
  viewMode: ViewMode;
  cardSize: CardSize;
  sortBy: SortBy;
  searchQuery: string;
  onAssetDeleted?: (assetId: number) => void;
};

export function AssetsList({ assets, locale, viewMode, cardSize, sortBy, searchQuery, onAssetDeleted }: AssetsListProps) {
  // Filter assets by search query
  const filteredAssets = assets.filter(asset =>
    (asset.name || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort assets based on sortBy
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      case 'dateCreated':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'dateModified':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Render different views
  if (viewMode === 'list') {
    return (
      <AssetListView assets={sortedAssets} locale={locale} onAssetDeleted={onAssetDeleted} />
    );
  }

  // Default folder view
  return (
    <AssetFolderView assets={sortedAssets} locale={locale} cardSize={cardSize} onAssetDeleted={onAssetDeleted} />
  );
}
