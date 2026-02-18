'use client';

import type { AssetData } from '@/entities';
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
import { MotChip } from '@/components/Assets/MotChip';
import { TaxChip } from '@/components/Assets/TaxChip';
import { RegistrationPlate } from '@/components/common/RegistrationPlate';
import { Asset } from '@/entities';
import { useHoverSound } from '@/hooks/useHoverSound';

type AssetListViewProps = {
  assets: AssetData[];
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
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: '50%' }}>Asset</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, display: { xs: 'none', sm: 'table-cell' }, width: '20%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: '20%' }}>Modified</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: '10%', textAlign: 'right' }}></TableCell>
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
                      onClick={() => router.push(`/${locale}/assets/${new Asset(asset).getPluralizedRoute()}/${asset.id}`)}
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
                      <TableCell sx={{ width: '50%' }}>
                        {asset.type === 'vehicle'
                          ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                {(asset.metadata?.specs?.registration || asset.registrationNumber) && (
                                  <RegistrationPlate
                                    registration={(asset.metadata?.specs?.registration || asset.registrationNumber)!}
                                    size="small"
                                  />
                                )}
                                {(asset.metadata?.specs?.make || asset.metadata?.specs?.model) && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      color: theme.palette.text.primary,
                                    }}
                                  >
                                    {[asset.metadata?.specs?.make, asset.metadata?.specs?.model].filter(Boolean).join(' ')}
                                  </Typography>
                                )}
                                {new Asset(asset).formatVehicleInfo() && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: theme.palette.text.secondary,
                                    }}
                                  >
                                    {`(${new Asset(asset).formatVehicleInfo()})`}
                                  </Typography>
                                )}
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                  <MotChip asset={asset} size="small" />
                                  <TaxChip asset={asset} size="small" />
                                </Box>
                              </Box>
                            )
                          : (
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
                            )}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: '20%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssetIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textTransform: 'capitalize' }}>
                            {asset.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: '20%' }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          {format(new Date(asset.updatedAt), 'MMM d, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: '10%' }} onClick={e => e.stopPropagation()}>
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
