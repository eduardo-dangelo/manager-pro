'use client';

import { Box, Chip, Fade, Typography } from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';
import { TransitionGroup } from 'react-transition-group';
import { AssetActions } from '@/components/Assets/AssetActions';
import { RegistrationPlate } from '@/components/common/RegistrationPlate';
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

type CardSize = 'small' | 'medium' | 'large';

type AssetFolderViewProps = {
  assets: Asset[];
  locale: string;
  cardSize: CardSize;
  onAssetDeleted?: (assetId: number) => void;
};

const statusColorMap: Record<string, 'default' | 'success' | 'info' | 'warning'> = {
  'active': 'success',
  'completed': 'info',
  'archived': 'default',
  'on-hold': 'warning',
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

export function AssetFolderView({ assets, locale, cardSize, onAssetDeleted }: AssetFolderViewProps) {
  // Get grid column sizes based on card size
  const getGridSizes = () => {
    switch (cardSize) {
      case 'small':
        return { xs: '33.33%', sm: '33.33%', md: '25%', lg: '20%', xl: '16.66%' }; // Smaller cards
      case 'large':
        return { xs: '100%', sm: '100%', md: '50%', lg: '33.33%', xl: '25%' }; // Full width alignment
      case 'medium':
      default:
        return { xs: '50%', sm: '50%', md: '33.33%', lg: '25%', xl: '20%' }; // 3 items per row
    }
  };

  // Get card height based on card size
  const getCardHeight = () => {
    switch (cardSize) {
      case 'small':
        return '100px'; // Smaller height for small view
      case 'large':
        return '280px'; // What was medium before
      case 'medium':
      default:
        return '180px'; // Smaller than before
    }
  };

  // Get font sizes based on card size
  const getFontSizes = () => {
    switch (cardSize) {
      case 'small':
        return {
          title: '0.9rem',
          description: '0.7rem',
          caption: '0.625rem',
        };
      case 'large':
        return {
          title: '1.125rem', // What was medium before
          description: '0.75rem',
          caption: '0.75rem',
        };
      case 'medium':
      default:
        return {
          title: '1rem',
          description: '0.75rem',
          caption: '0.6875rem',
        };
    }
  };

  const cardHeight = getCardHeight();
  const fontSizes = getFontSizes();
  const { playHoverSound } = useHoverSound();

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
      <TransitionGroup component={null}>
        {assets.map(asset => (
          // <Collapse orientation="horizontal" key={asset.id}>

          <Box
            key={asset.id}
            component={Link}
            href={`/${locale}/assets/${pluralizeType(asset.type)}/${asset.id}`}
            onMouseEnter={playHoverSound}
            sx={{
              'textDecoration': 'none',
              'cursor': 'pointer',
              'display': 'block',
              'perspective': '1000px',
              'padding': 0,
              'width': getGridSizes(),
              'transition': 'all 0.3s ease',
              '&:hover .folder-body': {
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
              },
              'p': 1,
              // 'border': '3px solid red',
            }}
          >
            {/* Folder visual container */}
            <Box sx={{
              position: 'relative',
              height: cardHeight,
              width: cardSize === 'small' ? '140px' : '100%',
              mx: cardSize === 'small' ? 'auto' : undefined,
              transition: 'all 0.3s ease',
            }}
            >

              {/* Folder Body */}
              <Box
                className="folder-body"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: '12px',
                  // borderTopLeftRadius: '0px',
                  p: 3,
                  pb: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  transformOrigin: 'top',
                }}
              >
                <Box sx={{ position: 'absolute', top: 6, right: 6 }} onClick={e => e.preventDefault()}>
                  <AssetActions
                    assetId={asset.id}
                    locale={locale}
                    onDeleted={onAssetDeleted ? () => onAssetDeleted(asset.id) : undefined}
                  />
                </Box>
                {/* Registration plate for vehicles */}
                {asset.type === 'vehicle' && (asset.metadata?.specs?.registration || asset.registrationNumber) && (
                  <Fade in={cardSize !== 'small'}>
                    <Box sx={{ mb: 0, mt: 0.5 }}>
                      <RegistrationPlate
                        registration={(asset.metadata?.specs?.registration || asset.registrationNumber)!}
                        size="medium"
                      />
                    </Box>
                  </Fade>
                )}
                {/* Asset name inside for non-small only */}
                <Fade in={cardSize !== 'small'}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontSize: fontSizes.title,
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1,
                      mt: asset.type === 'vehicle' && (asset.metadata?.specs?.registration || asset.registrationNumber) ? 0 : 0.5,
                    }}
                  >
                    {asset.name || 'Untitled'}
                  </Typography>
                </Fade>

                {/* Description */}
                <Fade in={cardSize !== 'small'}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: fontSizes.description,
                      color: 'text.secondary',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '2.5em',
                      flexGrow: 1,
                    }}
                  >
                    {asset.description}
                  </Typography>
                </Fade>
                {/* Status */}
                <Fade in={cardSize !== 'small'}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>

                    <Chip
                      label={asset.status ? asset.status.replace('-', ' ') : 'N/A'}
                      color={statusColorMap[asset.status || ''] || 'default'}
                      size="small"
                      sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    />

                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: fontSizes.caption,
                      }}
                    >
                      {format(new Date(asset.updatedAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Fade>
              </Box>
            </Box>

            {/* Name below folder for small */}
            {/* {cardSize === 'small' && ( */}
            <Fade in={cardSize === 'small'} unmountOnExit>
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  my: 1,
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {asset.name || 'Untitled'}
              </Typography>
            </Fade>
            {/* )} */}
          </Box>

          // </Collapse>
        ))}
      </TransitionGroup>
    </Box>
  );
}
