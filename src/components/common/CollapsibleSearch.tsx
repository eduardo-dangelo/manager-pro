'use client';

import { Search as SearchIcon } from '@mui/icons-material';
import { Badge, Box, IconButton, TextField, Tooltip } from '@mui/material';
import { useRef, useState } from 'react';

type CollapsibleSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  iconButtonSx?: object;
};

export function CollapsibleSearch({
  value,
  onChange,
  placeholder = 'Search',
  iconButtonSx,
}: CollapsibleSearchProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchFieldRef = useRef<HTMLInputElement>(null);

  const handleExpand = () => {
    setIsSearchExpanded(true);
    setTimeout(() => searchFieldRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setIsSearchExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchExpanded(false);
      onChange('');
      searchFieldRef.current?.blur();
    }
    if (e.key === 'Enter' && !value.length) {
      setIsSearchExpanded(false);
    }
  };

  const defaultIconButtonSx = {
    'height': 30,
    'width': 30,
    'border': 'none',
    'bgcolor': 'transparent',
    'borderRadius': '6px',
    'transition': 'all 0.2s ease',
    '&:hover': { bgcolor: 'action.hover' },
  };

  return (
    <Box
      sx={{
        width: isSearchExpanded ? 200 : 30,
        height: 45,
        transition: 'width 0.3s ease',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {!isSearchExpanded
        ? (
            <Tooltip title={placeholder}>
              <Badge
                badgeContent="1"
                invisible={!value.length}
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                onClick={handleExpand}
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
                  onClick={handleExpand}
                  sx={iconButtonSx ?? defaultIconButtonSx}
                >
                  <SearchIcon sx={{ color: 'grey.700', fontSize: 18 }} />
                </IconButton>
              </Badge>
            </Tooltip>
          )
        : (
            <TextField
              inputRef={searchFieldRef}
              label={placeholder}
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
              variant="outlined"
              sx={{
                'width': '100%',
                // 'height': '25px',
                '& .MuiInputBase-root': {
                  height: 35,
                },
              }}
              InputLabelProps={{
                shrink: true,
                sx: {
                  // left: value.length > 0 ? 0 : 22,
                },
              }}
              onFocus={() => setIsSearchExpanded(true)}
              onBlur={handleBlur}
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
  );
}
