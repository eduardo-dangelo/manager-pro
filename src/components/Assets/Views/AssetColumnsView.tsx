'use client';

import {
  Category as CategoryIcon,
  DirectionsCar as DirectionsCarIcon,
  Flight as FlightIcon,
  Folder as FolderIcon,
  HomeWork as HomeWorkIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import {
  Box,
  Collapse,
  Fade,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { AssetDetail } from '@/app/[locale]/(auth)/assets/[id]/AssetDetail';
import { AssetActions } from '@/components/Assets/AssetActions';
import { useHoverSound } from '@/hooks/useHoverSound';

type Asset = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

type AssetColumnsViewProps = {
  assets: Asset[];
  locale: string;
  onAssetDeleted?: (assetId: number) => void;
};

// Removed unused color and status maps after simplifying sidebar items

const assetTypeIcons = {
  vehicle: DirectionsCarIcon,
  property: HomeWorkIcon,
  person: PersonIcon,
  project: WorkIcon,
  trip: FlightIcon,
  custom: CategoryIcon,
};

// Removed route pluralization helper since we no longer navigate on click

export function AssetColumnsView({ assets, locale, onAssetDeleted }: AssetColumnsViewProps) {
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedAssetId, setClickedAssetId] = useState<number | null>(null);
  const isMobile = useMediaQuery('(max-width:930px)');
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();

  // Clear clicked state when selectedAsset changes (asset loads)
  useEffect(() => {
    if (selectedAsset) {
      setClickedAssetId(null);
    }
  }, [selectedAsset]);

  if (isMobile) {
    return null;
  }

  const loadAsset = async (assetId: number) => {
    try {
      setIsLoading(true);
      setSelectedAsset(null);
      const res = await fetch(`/${locale}/api/assets/${assetId}`);
      if (!res.ok) {
        throw new Error('Failed to load asset');
      }
      const { asset } = await res.json();
      setSelectedAsset(asset);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fade in={true} unmountOnExit>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{
          'width': 320,
          'borderRadius': 2,
          'border': 1,
          'borderColor': 'divider',
          'overflowY': 'auto',
          'bgcolor': 'background.paper',
          'p': 1,
          'maxHeight': 'calc(100vh - 180px)', // Account for GlobalTopbar (~58px) + AssetsTopBar (~50px) + margins (~72px)
          'mb': 2,
          // Custom thin scrollbar
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            'background': theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)',
            'borderRadius': '3px',
            '&:hover': {
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.12)',
            },
          },
          // Firefox scrollbar
          'scrollbarWidth': 'thin',
          'scrollbarColor': theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08) transparent'
            : 'rgba(0, 0, 0, 0.08) transparent',
        }}
        >
          <List sx={{ px: 0, py: 0 }}>
            <TransitionGroup component={null}>
              {assets.map((asset) => {
                const AssetIcon = assetTypeIcons[asset.type as keyof typeof assetTypeIcons] || FolderIcon;
                // If an asset was clicked, only that asset should be active (optimistic UI update)
                // This ensures the previous active item loses its active state immediately
                const isActive = clickedAssetId
                  ? clickedAssetId === asset.id
                  : selectedAsset?.id === asset.id;

                return (
                  <Collapse key={asset.id} timeout={300}>
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => {
                          if (selectedAsset?.id === asset.id) {
                            setSelectedAsset(null);
                            setClickedAssetId(null);
                            return;
                          }
                          setClickedAssetId(asset.id);
                          loadAsset(asset.id);
                        }}
                        onMouseEnter={playHoverSound}
                        sx={{
                          'borderRadius': 2,
                          'color': isActive ? theme.palette.text.primary : theme.palette.text.secondary,
                          'bgcolor': isActive ? (theme.palette.mode === 'dark' ? theme.palette.action.selected : theme.palette.action.selected) : 'transparent',
                          'pl': 2,
                          'pr': 2,
                          'py': 0.5,
                          // 'boxShadow': isActive ? '0 4px 26px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)' : 'none',
                          'transition': 'boxShadow 0.3s ease-in-out',
                          '&:hover': {
                            'bgcolor': theme.palette.mode === 'dark' ? theme.palette.action.selected : theme.palette.action.hover,
                            'color': theme.palette.text.primary,
                            // 'boxShadow': isActive ? theme.shadows[40] : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                            '& .MuiListItemIcon-root': {
                              color: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AssetIcon
                            sx={{
                              fontSize: 20,
                              color: theme.palette.primary.main,
                              transition: 'color 0.2s',
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={asset.name.length > 30 ? `${asset.name.slice(0, 40)}…` : asset.name}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Collapse>
                );
              })}
            </TransitionGroup>
          </List>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', px: 2 }}>
          {!selectedAsset && (
            <Box sx={{
              // border: 1,
              // borderColor: 'grey.200',
              // borderRadius: 2,
              // bgcolor: 'white',
              p: 3,
              color: 'grey.600',
            }}
            >
              {isLoading
                ? (
                    <>
                      <Skeleton variant="text" width={200} height={38} />
                      <Skeleton variant="rectangular" height={100} sx={{ mt: 3, borderRadius: 1 }} />
                    </>
                  )
                : (
                    <Typography variant="body1">Select an asset to see details</Typography>
                  )}
            </Box>
          )}
          {selectedAsset && (
            <AssetDetail
              asset={selectedAsset}
              locale={locale}
              hideBreadcrumb
              headerActions={(
                <AssetActions
                  assetId={selectedAsset.id}
                  locale={locale}
                  onDeleted={() => {
                    setSelectedAsset(null);
                    onAssetDeleted?.(selectedAsset.id);
                  }}
                  onCompleted={() => setSelectedAsset({ ...selectedAsset, status: 'completed' })}
                />
              )}
            />
          )}
        </Box>
      </Box>
    </Fade>
  );
}

