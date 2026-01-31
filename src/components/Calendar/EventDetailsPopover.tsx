'use client';

import type { CalendarEvent } from './types';
import type { Asset } from '@/components/Assets/utils';
import { pluralizeType } from '@/components/Assets/utils';
import { AssetCard } from '@/components/Assets/AssetCard';
import { Close as CloseIcon } from '@mui/icons-material';
import { Box, IconButton, Popover, Typography } from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { COLOR_MAP } from './constants';

const POPOVER_WIDTH = 320;
const POPOVER_GAP = 8;

type EventDetailsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  event: CalendarEvent | null;
  assets?: Asset[];
  showAssetCard?: boolean;
  onClose: () => void;
  locale: string;
};

function getAnchorOrigin(anchorEl: HTMLElement | null): { vertical: 'top' | 'center' | 'bottom'; horizontal: 'left' | 'center' | 'right' } {
  if (!anchorEl) {
    return { vertical: 'center', horizontal: 'left' };
  }
  if (typeof window === 'undefined') {
    return { vertical: 'center', horizontal: 'right' };
  }
  const rect = anchorEl.getBoundingClientRect();
  const spaceOnRight = window.innerWidth - rect.right;
  const spaceOnLeft = rect.left;
  const openToRight = spaceOnRight >= POPOVER_WIDTH + POPOVER_GAP || spaceOnRight >= spaceOnLeft;
  return {
    vertical: 'center',
    horizontal: openToRight ? 'right' : 'left',
  };
}

function getTransformOrigin(anchorOrigin: { vertical: string; horizontal: string }): { vertical: 'top' | 'center' | 'bottom'; horizontal: 'left' | 'center' | 'right' } {
  return {
    vertical: 'center',
    horizontal: anchorOrigin.horizontal === 'right' ? 'left' : 'right',
  };
}

function eventColor(color: string | null): string {
  if (!color) {
    return '#6b7280';
  }
  return COLOR_MAP[color] ?? color;
}

export function EventDetailsPopover({
  open,
  anchorEl,
  event,
  assets,
  showAssetCard = false,
  onClose,
  locale,
}: EventDetailsPopoverProps) {
  const t = useTranslations('Calendar');

  const anchorOrigin = useMemo(() => {
    if (!open || !anchorEl) {
      return { vertical: 'center' as const, horizontal: 'left' as const };
    }
    return getAnchorOrigin(anchorEl);
  }, [open, anchorEl]);

  const transformOrigin = useMemo(() => getTransformOrigin(anchorOrigin), [anchorOrigin]);

  if (!event) {
    return null;
  }

  const color = eventColor(event.color);
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const isSameDay = format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
  const asset = assets?.find(a => a.id === event.assetId) ?? null;
  const assetName = asset?.name ?? null;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          sx: {
            minWidth: POPOVER_WIDTH,
            maxWidth: POPOVER_WIDTH,
            borderRadius: 2,
            marginLeft: anchorOrigin.horizontal === 'right' ? `${POPOVER_GAP}px` : undefined,
            marginRight: anchorOrigin.horizontal === 'left' ? `${POPOVER_GAP}px` : undefined,
          },
        },
      }}
      disableRestoreFocus
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              borderLeft: '4px solid',
              borderLeftColor: color,
              pl: 1.5,
            }}
          >
            <Typography variant="h6" component="div" fontWeight={600} sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
              {event.name}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="close"
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {showAssetCard && asset && (
          <Box
            component={Link}
            href={`/${locale}/assets/${pluralizeType(asset.type)}/${asset.id}`}
            sx={{
              display: 'block',
              textDecoration: 'none',
              mb: 2,
              '&:hover .folder-body': {
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <AssetCard asset={asset} locale={locale} cardSize="small" compact />
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('event_date')}
            </Typography>
            <Typography variant="body2">
              {isSameDay
                ? format(startDate, 'EEEE, MMMM d, yyyy')
                : `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('event_start_time')} – {t('event_end_time')}
            </Typography>
            <Typography variant="body2">
              {format(startDate, 'HH:mm')} – {format(endDate, 'HH:mm')}
            </Typography>
          </Box>

          {event.description && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('event_description')}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {event.description}
              </Typography>
            </Box>
          )}

          {event.location && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('event_location')}
              </Typography>
              <Typography variant="body2">
                {event.location}
              </Typography>
            </Box>
          )}

          {assetName && !showAssetCard && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('event_asset')}
              </Typography>
              <Typography variant="body2">
                {assetName}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Popover>
  );
}
