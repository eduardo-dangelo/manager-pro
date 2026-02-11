'use client';

import type { CalendarEvent } from './types';
import type { AssetData } from '@/entities';
import { Close as CloseIcon, EditOutlined as EditIcon, OpenInNewOutlined as OpenInNewIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AssetCard } from '@/components/Assets/AssetCard';
import { Popover } from '@/components/common/Popover';
import { Asset } from '@/entities';
import { COLOR_MAP } from './constants';

const POPOVER_WIDTH = 320;

type EventDetailsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  anchorPosition?: { top: number; left: number } | null;
  event: CalendarEvent | null;
  assets?: AssetData[];
  showAssetCard?: boolean;
  onClose: () => void;
  locale: string;
  onEdit?: () => void;
};

const TAX_REMINDER_MARKER = '[AUTO:vehicle_tax_reminder]';
const MOT_REMINDER_MARKER = '[AUTO:vehicle_mot_reminder]';

function eventColor(color: string | null): string {
  if (!color) {
    return '#6b7280';
  }
  return COLOR_MAP[color] ?? color;
}

function isTaxReminderEvent(event: CalendarEvent): boolean {
  return event.description?.includes(TAX_REMINDER_MARKER) ?? false;
}

function hasUserVisibleDescription(event: CalendarEvent): boolean {
  const d = event.description?.trim();
  if (!d) {
    return false;
  }
  return d !== TAX_REMINDER_MARKER && d !== MOT_REMINDER_MARKER;
}

export function EventDetailsPopover({
  open,
  anchorEl,
  anchorPosition = null,
  event,
  assets,
  showAssetCard = false,
  onClose,
  locale,
  onEdit,
}: EventDetailsPopoverProps) {
  const t = useTranslations('Calendar');
  const tAssets = useTranslations('Assets');

  if (!event) {
    return null;
  }

  const color = eventColor(event.color);
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const isSameDay = format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
  const isAllDay
    = startDate.getHours() === 0
      && startDate.getMinutes() === 0
      && ((endDate.getHours() === 23 && endDate.getMinutes() === 59)
        || (endDate.getHours() === 0 && endDate.getMinutes() === 0));
  const asset = assets?.find(a => a.id === event.assetId) ?? null;
  const assetName = asset?.name ?? null;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorPosition={anchorPosition}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      showArrow={anchorPosition == null}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {onEdit && (
              <IconButton
                size="small"
                onClick={onEdit}
                aria-label={t('edit_event')}
                sx={{ mt: -0.5 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={onClose}
              aria-label="close"
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {showAssetCard && asset && (
          <Box
            component={Link}
            href={`/${locale}/assets/${new Asset(asset).getPluralizedRoute()}/${asset.id}`}
            sx={{
              'display': 'block',
              'textDecoration': 'none',
              'mb': 2,
              '&:hover .folder-body': {
                bgcolor: 'action.hover',
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
              {t('event_start_time')}
              {' '}
              –
              {t('event_end_time')}
            </Typography>
            <Typography variant="body2">
              {isAllDay ? t('all_day') : `${format(startDate, 'HH:mm')} – ${format(endDate, 'HH:mm')}`}
            </Typography>
          </Box>

          {event.description && hasUserVisibleDescription(event) && (
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

          {isTaxReminderEvent(event) && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<OpenInNewIcon />}
              fullWidth
              onClick={() => window.open('https://www.gov.uk/vehicle-tax', '_blank', 'noopener,noreferrer')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {tAssets('tax_your_vehicle')}
            </Button>
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
