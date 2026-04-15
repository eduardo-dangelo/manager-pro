'use client';

import type { Activity } from './types';
import type { FilePreviewItem } from '@/components/Assets/Asset/tabs/FilePreviewPopover';
import type { CalendarEvent } from '@/components/Calendar/types';
import type { AssetData } from '@/entities';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import Timeline from '@mui/lab/Timeline';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { DocsPreviewDialog } from '@/components/Assets/Asset/tabs/docs/DocsPreviewDialog';
import { EventDetailsPopover } from '@/components/Calendar/EventDetailsPopover';
import { ActivityItem } from './ActivityItem';

type ActivityTimelineProps = {
  activities: Activity[];
  showAssetLink?: boolean;
  locale: string;
  emptyMessage?: string;
  assets?: AssetData[];
};

export function ActivityTimeline({
  activities,
  showAssetLink = false,
  locale,
  emptyMessage,
  assets,
}: ActivityTimelineProps) {
  const t = useTranslations('Activity');
  const tAssets = useTranslations('Assets');
  const defaultEmpty = t('no_activities');

  const [eventDetailsAnchor, setEventDetailsAnchor] = useState<HTMLElement | null>(null);
  const [eventDetailsEvent, setEventDetailsEvent] = useState<CalendarEvent | null>(null);
  const [docsPreviewOpen, setDocsPreviewOpen] = useState(false);
  const [docsPreviewItem, setDocsPreviewItem] = useState<FilePreviewItem | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewItem, setImagePreviewItem] = useState<FilePreviewItem | null>(null);

  const handleEventClick = useCallback(
    async (eventId: number, anchorEl: HTMLElement) => {
      setEventDetailsAnchor(anchorEl);
      try {
        const res = await fetch(`/${locale}/api/calendar-events/${eventId}`);
        if (!res.ok) {
          setEventDetailsAnchor(null);
          setEventDetailsEvent(null);
          return;
        }
        const data = (await res.json()) as { event: CalendarEvent };
        setEventDetailsEvent(data.event);
      } catch {
        setEventDetailsAnchor(null);
        setEventDetailsEvent(null);
      }
    },
    [locale],
  );

  const handleEventDetailsClose = () => {
    setEventDetailsAnchor(null);
    setEventDetailsEvent(null);
  };

  const handleFileClick = useCallback((item: { id: string; name: string; url: string }, type: 'pdf' | 'image') => {
    if (type === 'pdf') {
      setDocsPreviewItem(item);
      setDocsPreviewOpen(true);
      return;
    }
    setImagePreviewItem(item);
    setImagePreviewOpen(true);
  }, []);

  if (activities.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }} elevation={1}>
        <Typography color="text.secondary">
          {emptyMessage ?? defaultEmpty}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Timeline
        position="right"
        sx={{
          p: 0,
          m: 0,
          maxWidth: '100%',
          [`& .MuiTimelineItem-root:before`]: {
            flex: 0,
            padding: 0,
          },
          // @mui/lab TimelineDot uses 11.5px vertical margin by default
          [`& .MuiTimelineDot-root`]: {
            marginTop: 0,
            marginBottom: 0,
          },
        }}
      >
        {activities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            showAssetLink={showAssetLink}
            locale={locale}
            isLast={index === activities.length - 1}
            onEventClick={handleEventClick}
            onFileClick={handleFileClick}
          />
        ))}
      </Timeline>

      {eventDetailsAnchor != null && eventDetailsEvent != null && (
        <EventDetailsPopover
          open
          anchorEl={eventDetailsAnchor}
          event={eventDetailsEvent}
          assets={assets}
          showAssetCard
          onClose={handleEventDetailsClose}
          locale={locale}
        />
      )}
      <DocsPreviewDialog
        open={docsPreviewOpen}
        item={docsPreviewItem}
        onClose={() => {
          setDocsPreviewOpen(false);
          setDocsPreviewItem(null);
        }}
        t={tAssets}
      />
      <Dialog
        open={imagePreviewOpen}
        onClose={() => {
          setImagePreviewOpen(false);
          setImagePreviewItem(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh', bgcolor: 'background.paper' },
        }}
      >
        {imagePreviewItem && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                {imagePreviewItem.name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setImagePreviewOpen(false);
                  setImagePreviewItem(null);
                }}
                aria-label={tAssets('cancel')}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box
                component="img"
                src={imagePreviewItem.url}
                alt={imagePreviewItem.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                component="a"
                href={imagePreviewItem.url}
                download={imagePreviewItem.name}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: 'none' }}
              >
                {tAssets('file_download')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
