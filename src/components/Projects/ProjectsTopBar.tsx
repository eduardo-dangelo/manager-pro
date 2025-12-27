'use client';

import {
  Add as AddIcon,
  ViewColumn as ColumnsIcon,
  ViewModule as FolderIcon,
  ViewModule as LargeIcon,
  ViewList as ListIcon,
  ViewModule as MediumIcon,
  Search as SearchIcon,
  ViewModule as SmallIcon,
  SwapVert as SortIcon,

} from '@mui/icons-material';
import {
  Badge,
  Box,
  ClickAwayListener,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useSetBreadcrumb } from '@/components/BreadcrumbContext';

// no-op

type ViewMode = 'folder' | 'list' | 'columns';
type CardSize = 'small' | 'medium' | 'large';
type SortBy = 'dateCreated' | 'dateModified' | 'name' | 'type' | 'status';

type ProjectsTopBarProps = {
  searchQuery: string;
  viewMode: ViewMode;
  cardSize: CardSize;
  sortBy: SortBy;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onCardSizeChange: (size: CardSize) => void;
  onSortByChange: (sort: SortBy) => void;
  onCreateProject: () => void;
  locale: string;
  projectType?: string;
};

export function ProjectsTopBar({
  searchQuery,
  viewMode,
  cardSize,
  sortBy,
  onSearchChange,
  onViewModeChange,
  onCardSizeChange,
  onSortByChange,
  onCreateProject,
  locale,
  projectType,
}: ProjectsTopBarProps) {
  const theme = useTheme();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const sortOpen = Boolean(sortAnchorEl);
  const t = useTranslations('Projects');
  const dashboardT = useTranslations('DashboardLayout');
  
  // Determine page title based on project type
  const getPageTitle = () => {
    if (projectType) {
      return (t as any)(`type_${projectType}`);
    }
    return t('page_title');
  };

  // Set breadcrumb in global topbar
  useSetBreadcrumb([
    { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
    { label: t('page_title'), href: `/${locale}/projects` },
    ...(projectType ? [{ label: getPageTitle() }] : []),
  ]);

  // no-op

  // Optimistic UI updates with error rollback
  const handleViewModeChange = async (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      const oldMode = viewMode;
      onViewModeChange(newMode); // Immediate UI update

      try {
        await fetch(`/${locale}/api/users/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectsViewMode: newMode }),
        });
      } catch (error) {
        console.error('Failed to update view mode:', error);
        onViewModeChange(oldMode); // Rollback on error
      }
    }
  };

  const handleCardSizeChange = async (_event: React.MouseEvent<HTMLElement>, newSize: CardSize | null) => {
    if (newSize !== null) {
      const oldSize = cardSize;
      onCardSizeChange(newSize); // Immediate UI update

      try {
        await fetch(`/${locale}/api/users/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectsCardSize: newSize }),
        });
      } catch (error) {
        console.error('Failed to update card size:', error);
        onCardSizeChange(oldSize); // Rollback on error
      }
    }
  };

  const handleSortByChange = async (newSort: SortBy) => {
    try {
      await fetch(`/${locale}/api/users/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectsSortBy: newSort }),
      });
      onSortByChange(newSort);
    } catch (error) {
      console.error('Failed to update sort preference:', error);
    }
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (value: SortBy) => {
    handleSortByChange(value);
    handleSortClose();
  };

  // Collapsible search handlers
  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    setIsSearchExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchExpanded(false);
      onSearchChange('');
      if (searchFieldRef.current) {
        searchFieldRef.current.blur();
      }
    }
    if (e.key === 'Enter') {
      if (!searchQuery.length) {
        setIsSearchExpanded(false);
      }
    }
  };

  // Button group styling
  const buttonGroupSx = {
    'color': theme.palette.text.secondary,
    '&:hover': {
      bgcolor: theme.palette.action.hover,
    },
    '& .MuiToggleButtonGroup-root': {
      border: 'none',
    },
    '& .MuiToggleButton-root': {
      'color': theme.palette.text.secondary,
      'height': 30,
      'width': 30,
      'border': 'none',
      'bgcolor': 'transparent',
      'borderRadius': '6px',
      'transition': 'all 0.2s ease',
      '&:hover': {
        bgcolor: theme.palette.action.hover,
      },
      '&.Mui-selected': {
        'color': theme.palette.text.primary,
        'bgcolor': theme.palette.action.selected,
        'borderRadius': '6px',
        '&:hover': {
          bgcolor: theme.palette.action.hover,
        },
      },
    },
  };

  // Icon button styling matching button group
  const iconButtonSx = {
    'height': 30,
    'width': 30,
    'border': 'none',
    'bgcolor': 'transparent',
    'borderRadius': '6px',
    'transition': 'all 0.2s ease',
    '&:hover': {
      bgcolor: theme.palette.action.hover,
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        mb: 3,
        position: 'sticky',
        top: { xs: 112, lg: 56 }, // Position directly below GlobalTopbar (account for mobile AppBar + GlobalTopbar with breadcrumb)
        zIndex: 100,
        borderRadius: 2,
        bgcolor: theme.palette.background.default,
        pb: 0,
      }}
    >
      {/* Right side controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Card Size Controls (only visible in folder view) */}
        {viewMode === 'folder' && (
          <>
            <ToggleButtonGroup
              value={cardSize}
              exclusive
              onChange={handleCardSizeChange}
              size="small"
              sx={buttonGroupSx}
            >
              <Tooltip title="Small cards">
                <ToggleButton value="small" aria-label="small cards">
                  <SmallIcon sx={{ fontSize: 16 }} />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Medium cards">
                <ToggleButton value="medium" aria-label="medium cards">
                  <MediumIcon sx={{ fontSize: 18 }} />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Large cards">
                <ToggleButton value="large" aria-label="large cards">
                  <LargeIcon sx={{ fontSize: 20 }} />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>

            {/* Vertical Divider */}
            <Box
              sx={{
                // width: '1px',
                height: 20,
                bgcolor: 'grey.300',
                mx: 1,
              }}
            />
          </>
        )}

        {/* View Mode Controls */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={buttonGroupSx}
        >
          <Tooltip title="Folder view">
            <ToggleButton value="folder" aria-label="folder view">
              <FolderIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="List view">
            <ToggleButton value="list" aria-label="list view">
              <ListIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          {/* Hide columns view on iPhone-width screens */}
          {!useMediaQuery('(max-width:930px)') && (
            <Tooltip title="Columns view">
              <ToggleButton value="columns" aria-label="columns view">
                <ColumnsIcon sx={{ fontSize: 18 }} />
              </ToggleButton>
            </Tooltip>
          )}
        </ToggleButtonGroup>

        {/* Sort Controls */}
        <Tooltip title="Sort by">
          <Badge
            badgeContent="1"
            invisible={sortBy === 'dateModified'}
            overlap="circular"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            onClick={handleSortClick}
            sx={{
              'cursor': 'pointer',
              '& .MuiBadge-badge': {
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: '0.625rem',
                fontWeight: 600,
                width: 14,
                height: 14,
                minWidth: 16,
                cursor: 'pointer',
              },
            }}
          >
            <IconButton
              size="small"
              onClick={handleSortClick}
              sx={{ ...iconButtonSx, bgcolor: sortOpen ? theme.palette.action.hover : 'transparent' }}
            >
              <SortIcon sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
            </IconButton>
          </Badge>
        </Tooltip>

        <Popper
          open={sortOpen}
          anchorEl={sortAnchorEl}
          role={undefined}
          placement="bottom-end"
          transition
          disablePortal
          style={{ zIndex: 1300 }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'right top',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleSortClose}>
                  <MenuList autoFocusItem={sortOpen} id="sort-menu">
                    <MenuItem
                      onClick={() => handleSortSelect('dateModified')}
                      selected={sortBy === 'dateModified'}
                    >
                      Date Modified
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleSortSelect('dateCreated')}
                      selected={sortBy === 'dateCreated'}
                    >
                      Date Created
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleSortSelect('name')}
                      selected={sortBy === 'name'}
                    >
                      Name
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleSortSelect('type')}
                      selected={sortBy === 'type'}
                    >
                      Type
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleSortSelect('status')}
                      selected={sortBy === 'status'}
                    >
                      Status
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>

        {/* Vertical Divider */}
        <Box
          sx={{
            width: '1px',
            height: 20,
            bgcolor: theme.palette.action.selected,
            mx: 1,
          }}
        />
        <Tooltip title="New Project">
          <IconButton
            size="small"
            onClick={onCreateProject}
            sx={iconButtonSx}
          >
            <AddIcon sx={{ color: 'grey.700', fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Collapsible Search */}
        <Box
          sx={{
            width: isSearchExpanded ? 200 : 30,
            height: 45,
            // overflow: 'hidden',
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {!isSearchExpanded
            ? (
                <Tooltip title="Search projects">
                  <Badge
                    badgeContent="1"
                    invisible={!searchQuery.length}
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    onClick={() => {
                      setIsSearchExpanded(true);
                      setTimeout(() => searchFieldRef.current?.focus(), 0);
                    }}
                    sx={{
                      'cursor': 'pointer',
                      '& .MuiBadge-badge': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        width: 14,
                        height: 14,
                        minWidth: 16,
                        cursor: 'pointer',
                      },
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsSearchExpanded(true);
                        setTimeout(() => searchFieldRef.current?.focus(), 0);
                      }}
                      sx={iconButtonSx}
                    >
                      <SearchIcon sx={{ color: 'grey.700', fontSize: 18 }} />
                    </IconButton>
                  </Badge>
                </Tooltip>
              )
            : (
                <TextField
                  inputRef={searchFieldRef}
                  label="Search projects"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  size="small"
                  variant="outlined"
                  sx={{
                    'width': '100%',
                    'height': 35,
                    '& .MuiInputBase-root': {
                      height: 40,
                    },
                  }}
                  InputLabelProps={{
                    shrink: searchQuery.length > 0,
                    sx: {
                      left: searchQuery.length > 0 ? 0 : 22,
                    },
                  }}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', pr: 0.5 }}>
                        <SearchIcon sx={{ color: 'grey.500', fontSize: 18 }} />
                      </Box>
                    ),
                  }}
                />
              )}

        </Box>
      </Box>
    </Box>
  );
}
