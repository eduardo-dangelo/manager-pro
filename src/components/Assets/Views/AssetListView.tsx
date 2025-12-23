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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { TransitionGroup } from 'react-transition-group';
import { AssetActions } from '@/components/Assets/AssetActions';
import { useHoverSound } from '@/hooks/useHoverSound';

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

type AssetListViewProps = {
  assets: Asset[];
  locale: string;
  onAssetDeleted?: (assetId: number) => void;
};

// Removed status column

const assetTypeIcons = {
  vehicle: DirectionsCarIcon,
  property: HomeWorkIcon,
  person: PersonIcon,
  project: WorkIcon,
  trip: FlightIcon,
  custom: CategoryIcon,
};

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

export function AssetListView({ assets, locale, onAssetDeleted }: AssetListViewProps) {
  const theme = useTheme();
  const router = useRouter();
  const { playHoverSound } = useHoverSound();
  return (
    <Fade in={true} unmountOnExit>
      <TableContainer
        sx={{
          'bgcolor': theme.palette.background.default,
          'borderRadius': 2,
          'overflow': 'visible',
          'transition': 'box-shadow 0.2s ease',
          '&:hover': {
          // boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Table
          size="small"
          sx={{
            'width': '100%',
            // 'tableLayout': 'fixed',
            '& .MuiTableCell-root': { py: 0.75 },
          }}
        >
          <TableHead
            sx={{
              'position': 'sticky',
              'top': 102, // Position directly below GlobalTopbar (58px) + AssetsTopBar (~50px) with no vertical gap
              'zIndex': 90,
              'bgcolor': 'background.default',
              '& tr': {
                bgcolor: theme.palette.action.hover,
              },

            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: '25%' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, display: { xs: 'none', sm: 'table-cell' }, width: '15%' }}>Type</TableCell>
              {/* Status column removed */}
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, display: { xs: 'none', sm: 'table-cell' }, width: '15%' }}>Progress</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, display: { xs: 'none', sm: 'none', md: 'table-cell' }, width: '15%' }}>Tasks</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: '20%' }}>Modified</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: 80, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TransitionGroup component={null}>
              {assets.map((asset, index) => {
                const AssetIcon = assetTypeIcons[asset.type as keyof typeof assetTypeIcons] || FolderIcon;

                return (
                  <Collapse
                    key={asset.id}
                    timeout={300}
                    sx={{
                      '&.MuiCollapse-root': {
                        display: 'contents !important',
                      },
                      '& > .MuiCollapse-wrapper': {
                        display: 'contents !important',
                      },
                      '& > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner': {
                        display: 'contents !important',
                      },
                    }}
                  >
                    <TableRow
                      onMouseEnter={playHoverSound}
                      onClick={() => router.push(`/${locale}/assets/${pluralizeType(asset.type)}/${asset.id}`)}
                      sx={{
                        'bgcolor': index % 2 === 1 ? theme.palette.action.hover : 'inherit',
                        'transition': 'box-shadow 0.2s ease',
                        '&:hover': {
                          'bgcolor': theme.palette.action.selected,
                          'boxShadow': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                          '& .MuiSvgIcon-root': {
                            color: theme.palette.primary.main,
                          },
                        },
                        '&:last-child td': {
                          borderBottom: 0,
                        },
                        'cursor': 'pointer',
                      }}
                    >
                      <TableCell sx={{ width: '25%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: theme.palette.text.primary,
                              mb: 0.25,
                            }}
                          >
                            {asset.name || 'Untitled'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: '15%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssetIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textTransform: 'capitalize' }}>
                            {asset.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      {/* Status column removed */}
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: '12%' }}>
                        <Typography variant="body2" sx={{ color: 'grey.600' }}>
                          --%
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' }, width: '12%' }}>
                        <Typography variant="body2" sx={{ color: 'grey.600' }}>
                          --
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '20%' }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          {format(new Date(asset.updatedAt), 'MMM d, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: 80 }} onClick={e => e.stopPropagation()}>
                        <AssetActions
                          assetId={asset.id}
                          locale={locale}
                          onDeleted={onAssetDeleted ? () => onAssetDeleted(asset.id) : undefined}
                        />
                      </TableCell>
                    </TableRow>
                  </Collapse>
                );
              })}
            </TransitionGroup>
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  );
}
