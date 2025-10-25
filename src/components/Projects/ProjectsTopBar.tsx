'use client';

import {
  ViewModule as FolderIcon,
  ViewList as ListIcon,
  ViewColumn as ColumnsIcon,
  Search as SearchIcon,
  ViewModule as SmallIcon,
  ViewModule as MediumIcon,
  ViewModule as LargeIcon,
} from '@mui/icons-material';
import {
  Box,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';

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
  locale: string;
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
  locale,
}: ProjectsTopBarProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleViewModeChange = async (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setIsUpdating(true);
      try {
        await fetch(`/${locale}/api/users/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectsViewMode: newMode }),
        });
        onViewModeChange(newMode);
      } catch (error) {
        console.error('Failed to update view mode:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCardSizeChange = async (event: React.MouseEvent<HTMLElement>, newSize: CardSize | null) => {
    if (newSize !== null) {
      setIsUpdating(true);
      try {
        await fetch(`/${locale}/api/users/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectsCardSize: newSize }),
        });
        onCardSizeChange(newSize);
      } catch (error) {
        console.error('Failed to update card size:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleSortByChange = async (event: any) => {
    const newSort = event.target.value as SortBy;
    setIsUpdating(true);
    try {
      await fetch(`/${locale}/api/users/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectsSortBy: newSort }),
      });
      onSortByChange(newSort);
    } catch (error) {
      console.error('Failed to update sort preference:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
      }}
    >
      {/* Search Bar */}
      <TextField
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{ minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'grey.500' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Right side controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Card Size Controls (only visible in folder view) */}
        {viewMode === 'folder' && (
          <ToggleButtonGroup
            value={cardSize}
            exclusive
            onChange={handleCardSizeChange}
            size="small"
            disabled={isUpdating}
            sx={{
              '& .MuiToggleButton-root': {
                border: '1px solid',
                borderColor: 'grey.300',
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: 'grey.50',
                },
                '&.Mui-selected': {
                  bgcolor: 'grey.200',
                  borderColor: 'grey.400',
                },
              },
            }}
          >
            <ToggleButton value="small" aria-label="small cards">
              <SmallIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
            <ToggleButton value="medium" aria-label="medium cards">
              <MediumIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
            <ToggleButton value="large" aria-label="large cards">
              <LargeIcon sx={{ fontSize: 20 }} />
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* View Mode Controls */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          disabled={isUpdating}
          sx={{
            '& .MuiToggleButton-root': {
              border: '1px solid',
              borderColor: 'grey.300',
              bgcolor: 'white',
              '&:hover': {
                bgcolor: 'grey.50',
              },
              '&.Mui-selected': {
                bgcolor: 'grey.200',
                borderColor: 'grey.400',
              },
            },
          }}
        >
          <ToggleButton value="folder" aria-label="folder view">
            <FolderIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ListIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
          <ToggleButton value="columns" aria-label="columns view">
            <ColumnsIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Sort Controls */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={sortBy}
            onChange={handleSortByChange}
            disabled={isUpdating}
            sx={{
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.300',
              '&:hover': {
                borderColor: 'grey.400',
              },
            }}
          >
            <MenuItem value="dateCreated">Date Created</MenuItem>
            <MenuItem value="dateModified">Date Modified</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="type">Type</MenuItem>
            <MenuItem value="status">Status</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
