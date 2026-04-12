export type AssetsListViewMode = 'folder' | 'list';
export type AssetsListFolderCardSize = 'medium' | 'large';
export type AssetsListSortBy = 'dateCreated' | 'dateModified' | 'name' | 'type' | 'status';

export type AssetsListPrefs = {
  viewMode: AssetsListViewMode;
  cardSize: AssetsListFolderCardSize;
  sortBy: AssetsListSortBy;
};

const STORAGE_PREFIX = 'manager-pro:assetsListPrefs:';

const VALID_VIEW: AssetsListViewMode[] = ['folder', 'list'];
const VALID_SORT: AssetsListSortBy[] = ['dateCreated', 'dateModified', 'name', 'type', 'status'];

const defaults: AssetsListPrefs = {
  viewMode: 'folder',
  cardSize: 'medium',
  sortBy: 'dateModified',
};

function normalizeCardSize(raw: unknown): AssetsListFolderCardSize {
  if (raw === 'small' || raw === 'medium') {
    return 'medium';
  }
  if (raw === 'large') {
    return 'large';
  }
  return defaults.cardSize;
}

export function loadAssetsListPrefs(locale: string): AssetsListPrefs {
  if (typeof window === 'undefined') {
    return defaults;
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${locale}`);
    if (!raw) {
      return defaults;
    }
    const p = JSON.parse(raw) as Partial<AssetsListPrefs>;
    const viewMode = VALID_VIEW.includes(p.viewMode as AssetsListViewMode)
      ? (p.viewMode as AssetsListViewMode)
      : defaults.viewMode;
    const cardSize = normalizeCardSize(p.cardSize);
    const sortBy = VALID_SORT.includes(p.sortBy as AssetsListSortBy)
      ? (p.sortBy as AssetsListSortBy)
      : defaults.sortBy;
    return { viewMode, cardSize, sortBy };
  } catch {
    return defaults;
  }
}

export function saveAssetsListPrefs(locale: string, prefs: AssetsListPrefs) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${locale}`, JSON.stringify(prefs));
  } catch {
    // ignore quota / private mode
  }
}
