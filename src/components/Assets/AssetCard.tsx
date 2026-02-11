'use client';

import type { AssetData } from '@/entities';
import { Asset } from '@/entities';
import { Box, Fade, Typography } from '@mui/material';
import { format } from 'date-fns';
import { AssetActions } from '@/components/Assets/AssetActions';
import { MotChip } from '@/components/Assets/MotChip';
import { TaxChip } from '@/components/Assets/TaxChip';
import { RegistrationPlate } from '@/components/common/RegistrationPlate';

export type CardSize = 'small' | 'medium' | 'large';

type AssetCardProps = {
  asset: AssetData;
  locale: string;
  cardSize: CardSize;
  compact?: boolean;
  onAssetDeleted?: (assetId: number) => void;
};

function getCardHeight(cardSize: CardSize, compact: boolean): string {
  if (compact) {
    return 'auto';
  }
  switch (cardSize) {
    case 'small':
      return '100px';
    case 'large':
      return '280px';
    case 'medium':
    default:
      return '180px';
  }
}

function getFontSizes(cardSize: CardSize) {
  switch (cardSize) {
    case 'small':
      return {
        title: '0.9rem',
        description: '0.7rem',
        caption: '0.625rem',
      };
    case 'large':
      return {
        title: '1.125rem',
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
}

export function AssetCard({ asset, locale, cardSize, compact = false, onAssetDeleted }: AssetCardProps) {
  const cardHeight = getCardHeight(cardSize, compact);
  const fontSizes = getFontSizes(cardSize);
  const showAssetActions = !compact;

  return (
    <Box
      sx={{
        position: 'relative',
        height: compact ? undefined : cardHeight,
        width: compact ? '100%' : cardSize === 'small' ? '140px' : '100%',
        mx: compact ? undefined : cardSize === 'small' ? 'auto' : undefined,
        transition: 'all 0.3s ease',
      }}
    >
      <Box
        className="folder-body"
        sx={{
          ...(compact ? {} : { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }),
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '12px',
          p: cardSize === 'small' && !compact ? 2 : compact ? 2 : 3,
          pb: cardSize === 'small' && !compact ? 1.5 : compact ? 1.5 : 2.5,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          transformOrigin: 'top',
        }}
      >
        {showAssetActions && (
          <Box sx={{ position: 'absolute', top: 6, right: 6 }} onClick={e => e.stopPropagation()}>
            <AssetActions
              assetId={asset.id}
              locale={locale}
              onDeleted={onAssetDeleted ? () => onAssetDeleted(asset.id) : undefined}
            />
          </Box>
        )}

        {/* Registration plate for vehicles */}
        {asset.type === 'vehicle' && (asset.metadata?.specs?.registration || asset.registrationNumber) && (
          <Fade in={true}>
            <Box sx={{ mb: 0, mt: 0 }}>
              <RegistrationPlate
                registration={(asset.metadata?.specs?.registration || asset.registrationNumber)!}
                size={cardSize}
              />
            </Box>
          </Fade>
        )}

        {/* Asset name inside for non-small only (or always in compact) */}
        <Fade in={compact || cardSize !== 'small'}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontSize: fontSizes.title,
              fontWeight: 600,
              color: 'text.primary',
              mb: 0,
              mt:
                asset.type === 'vehicle' && (asset.metadata?.specs?.registration || asset.registrationNumber)
                  ? 0
                  : 0.5,
              height: !compact && cardSize === 'small' ? '0px' : 'auto',
            }}
          >
            {asset.name || 'Untitled'}
          </Typography>
        </Fade>

        {/* Vehicle info string for medium/large sizes (or compact) */}
        {asset.type === 'vehicle' && new Asset(asset).formatVehicleInfo() && (
          <Fade in={true}>
            <Typography
              variant={cardSize === 'large' ? 'body2' : 'caption'}
              sx={{
                fontSize: cardSize === 'small' ? '0.525rem' : 'auto',
                color: 'text.secondary',
                mb: compact ? 0.5 : 1,
              }}
            >
              {new Asset(asset).formatVehicleInfo()}
            </Typography>
          </Fade>
        )}

        {/* Description - skip in compact or for vehicles */}
        {!compact && asset.type !== 'vehicle' && (
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
        )}

        {/* Updated date and MOT/TAX chips */}
        <Fade in={true}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 'auto' }}>
            {asset.type === 'vehicle' && (
              <Fade in={true}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1 }}>
                  <MotChip asset={asset} size={cardSize === 'small' ? 'small' : 'medium'} />
                  <TaxChip asset={asset} size={cardSize === 'small' ? 'small' : 'medium'} />
                </Box>
              </Fade>
            )}

            {!compact && cardSize === 'large' && (
              <Typography
                variant="caption"
                sx={{
                  p: 0,
                  color: 'text.secondary',
                  fontSize: fontSizes.caption,
                }}
              >
                {format(new Date(asset.updatedAt), 'MMM d, yyyy')}
              </Typography>
            )}
          </Box>
        </Fade>
      </Box>

      {/* Name below folder for small (when not compact) */}
      {!compact && (
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
      )}
    </Box>
  );
}
