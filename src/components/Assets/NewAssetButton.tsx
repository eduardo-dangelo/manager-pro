'use client';

import type { SxProps, Theme } from '@mui/material';
import {
  Add as AddIcon,
  Category as CategoryIcon,
  DirectionsCar as DirectionsCarIcon,
  Flight as FlightIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,

  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// Helper function to pluralize asset types for routes
const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    person: 'persons',
    project: 'projects',
    trip: 'trips',
    custom: 'customs',
  };
  return pluralMap[type] || `${type}s`;
};

const assetTypes = [
  { value: 'vehicle', label: 'type_vehicle', icon: DirectionsCarIcon },
  { value: 'property', label: 'type_property', icon: HomeIcon },
  { value: 'person', label: 'type_person', icon: PersonIcon },
  { value: 'project', label: 'type_project', icon: WorkIcon },
  { value: 'trip', label: 'type_trip', icon: FlightIcon },
  { value: 'custom', label: 'type_custom', icon: CategoryIcon },
];

type NewAssetButtonProps = {
  locale: string;
  preSelectedType?: string;
  iconButtonSx?: SxProps<Theme>;
  onAssetCreated?: (assetId: number) => void;
  tooltipTitle?: string;
};

export function NewAssetButton({
  locale,
  preSelectedType,
  iconButtonSx,
  onAssetCreated,
  tooltipTitle,
}: NewAssetButtonProps) {
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations('Assets');
  const [assetMenuAnchorEl, setAssetMenuAnchorEl] = useState<null | HTMLElement>(null);
  const assetMenuOpen = Boolean(assetMenuAnchorEl);
  const [isRecentlyCreated, setIsRecentlyCreated] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate tooltip title based on preSelectedType
  const getTooltipTitle = (): string => {
    if (tooltipTitle) {
      return tooltipTitle;
    }
    if (preSelectedType) {
      const assetType = assetTypes.find(type => type.value === preSelectedType);
      if (assetType) {
        // Use translation key like "new_vehicle", "new_property", etc.
        const newAssetKey = `new_${preSelectedType}` as any;
        // Try to get the translation
        const translation = t(newAssetKey);
        // If translation exists and is different from the key, use it
        // Otherwise fallback to "New {Type}" format
        if (translation && translation !== newAssetKey) {
          return translation;
        }
        // Fallback to "New {Type}" format
        const typeLabel = t(assetType.label as any);
        return `New ${typeLabel}`;
      }
      return 'New Asset';
    }
    return 'New Asset';
  };

  // Default icon button styling with better visibility
  const defaultIconButtonSx: SxProps<Theme> = {
    'height': 30,
    'width': 30,
    'border': 'none',
    'bgcolor': theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    'borderRadius': '6px',
    'transition': 'all 0.2s ease',
    '&:hover': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    ...iconButtonSx,
  };

  const handleAssetMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAssetMenuAnchorEl(event.currentTarget);
  };

  const handleAssetMenuClose = () => {
    setAssetMenuAnchorEl(null);
  };

  const handleCreateAsset = async (assetType: string) => {
    handleAssetMenuClose();

    try {
      const response = await fetch(`/${locale}/api/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: assetType }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create asset');
      }

      const data = await response.json();

      if (onAssetCreated) {
        onAssetCreated(data.asset.id);
      }

      // Only hide button for subitems (when preSelectedType is provided)
      if (preSelectedType) {
        setIsRecentlyCreated(true);
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Set timeout to reset state after 10 seconds
        timeoutRef.current = setTimeout(() => {
          setIsRecentlyCreated(false);
          timeoutRef.current = null;
        }, 5000);
      }

      router.push(`/${locale}/assets/${pluralizeType(data.asset.type)}/${data.asset.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if (preSelectedType) {
      // Directly create asset of the pre-selected type
      handleCreateAsset(preSelectedType);
    } else {
      // Show dropdown menu
      handleAssetMenuClick(event);
    }
  };

  // Hide button for subitems if recently created
  if (preSelectedType && isRecentlyCreated) {
    return null;
  }

  return (
    <>
      <Tooltip title={getTooltipTitle()}>
        <IconButton
          size="small"
          onClick={handleButtonClick}
          sx={defaultIconButtonSx}
        >
          <AddIcon sx={{
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            fontSize: 18,
          }}
          />
        </IconButton>
      </Tooltip>
      {!preSelectedType && (
        <Popper
          open={assetMenuOpen}
          anchorEl={assetMenuAnchorEl}
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
                <ClickAwayListener onClickAway={handleAssetMenuClose}>
                  <MenuList autoFocusItem={assetMenuOpen} id="asset-type-menu">
                    {assetTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <MenuItem
                          key={type.value}
                          onClick={() => handleCreateAsset(type.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Icon sx={{ fontSize: 20, color: 'grey.600' }} />
                            <Typography>{t(type.label as any)}</Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      )}
    </>
  );
}
