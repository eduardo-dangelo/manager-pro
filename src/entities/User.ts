export type UserPreferencesData = {
  theme: string;
  projectsViewMode: string;
  projectsCardSize: string;
  projectsSortBy: string;
  hoverSoundEnabled: string;
};

export type ViewMode = 'folder' | 'list' | 'columns';
export type CardSize = 'small' | 'medium' | 'large';
export type SortBy = 'dateCreated' | 'dateModified' | 'name' | 'type' | 'status';

export class User {
  static readonly VALID_THEMES = ['light', 'dark', 'system'] as const;
  static readonly VALID_VIEW_MODES: ViewMode[] = ['folder', 'list', 'columns'];
  static readonly VALID_CARD_SIZES: CardSize[] = ['small', 'medium', 'large'];
  static readonly VALID_SORT_BY: SortBy[] = ['dateCreated', 'dateModified', 'name', 'type', 'status'];
  static readonly VALID_HOVER_SOUND = ['true', 'false'] as const;

  static isValidTheme(theme: string): boolean {
    return User.VALID_THEMES.includes(theme as (typeof User.VALID_THEMES)[number]);
  }

  static isValidViewMode(mode: string): mode is ViewMode {
    return User.VALID_VIEW_MODES.includes(mode as ViewMode);
  }

  static isValidCardSize(size: string): size is CardSize {
    return User.VALID_CARD_SIZES.includes(size as CardSize);
  }

  static isValidSortBy(sort: string): sort is SortBy {
    return User.VALID_SORT_BY.includes(sort as SortBy);
  }
}
