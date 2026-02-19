'use client';

import type { Notification } from './types';
import type { CalendarEvent } from '@/components/Calendar/types';
import type { Asset } from '@/entities';
import {
  Box,
  Collapse,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { CreateEventPopover } from '@/components/Calendar/CreateEventPopover';
import { EventDetailsPopover } from '@/components/Calendar/EventDetailsPopover';
import { NotificationItem } from './NotificationItem';
import { Popover } from '@/components/common/Popover';
import { useGetAssets } from '@/queries/hooks/assets';
import { useGetNotifications, useMarkNotificationRead } from '@/queries/hooks/notifications';

const POPOVER_WIDTH = 360;
const POPOVER_MAX_HEIGHT = 400;

type NotificationsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  locale: string;
};

export function NotificationsPopover({
  open,
  anchorEl,
  onClose,
  locale,
}: NotificationsPopoverProps) {
  const t = useTranslations('Notifications');
  const { data: notifications = [], isLoading: loading } = useGetNotifications(locale);
  const markAsRead = useMarkNotificationRead(locale);
  const { data: assets = [] } = useGetAssets(locale);

  const [showOnlyUnread, setShowOnlyUnread] = useState(true);
  const [eventDetailsAnchor, setEventDetailsAnchor] = useState<HTMLElement | null>(null);
  const [eventDetailsEvent, setEventDetailsEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailsAssets, setEventDetailsAssets] = useState<Asset[]>([]);
  const [editPopoverAnchor, setEditPopoverAnchor] = useState<HTMLElement | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingAssets, setEditingAssets] = useState<Asset[]>([]);

  const displayedNotifications = showOnlyUnread
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleMarkAsRead = useCallback(
    async (n: Notification) => {
      if (n.read) {
        return;
      }
      await markAsRead.mutateAsync(n.id);
    },
    [markAsRead],
  );

  const handleEventNameClick = useCallback(
    async (e: React.MouseEvent<HTMLElement>, n: Notification) => {
      e.preventDefault();
      e.stopPropagation();
      const eventId = n.metadata?.eventId;
      if (eventId == null) {
        return;
      }
      setEventDetailsAnchor(e.currentTarget);
      try {
        const eventRes = await fetch(`/${locale}/api/calendar-events/${eventId}`);
        if (!eventRes.ok) {
          setEventDetailsAnchor(null);
          return;
        }
        const eventData = (await eventRes.json()) as { event: CalendarEvent };
        setEventDetailsEvent(eventData.event);
        setEventDetailsAssets(assets);
      } catch {
        setEventDetailsAnchor(null);
      }
    },
    [locale, assets],
  );

  const handleEventDetailsClose = useCallback(() => {
    setEventDetailsAnchor(null);
    setEventDetailsEvent(null);
    setEventDetailsAssets([]);
  }, []);

  const handleEditFromDetails = useCallback(() => {
    if (!eventDetailsEvent || !eventDetailsAnchor) {
      return;
    }
    setEditingEvent(eventDetailsEvent);
    setEditPopoverAnchor(eventDetailsAnchor);
    setEditingAssets(eventDetailsAssets);
    handleEventDetailsClose();
  }, [eventDetailsEvent, eventDetailsAnchor, eventDetailsAssets, handleEventDetailsClose]);

  const handleEditPopoverClose = useCallback(() => {
    setEditPopoverAnchor(null);
    setEditingEvent(null);
    setEditingAssets([]);
  }, []);

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        minWidth={POPOVER_WIDTH}
        maxWidth={POPOVER_WIDTH}
        maxHeight={POPOVER_MAX_HEIGHT}
      >
        <Box sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              // mb: 1.5,
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {t('title')}
            </Typography>
            <FormControlLabel
              control={(
                <Switch
                  size="small"
                  checked={showOnlyUnread}
                  onChange={(_, checked) => setShowOnlyUnread(checked)}
                />
              )}
              label={t('show_only_unread')}
              sx={{ mr: 0 }}
            />
          </Box>
          <Box sx={{ maxHeight: POPOVER_MAX_HEIGHT - 100, overflow: 'auto' }}>
            <TransitionGroup component={null}>
              {loading && (
                <Collapse key="loading" timeout={300}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    {t('loading')}
                  </Typography>
                </Collapse>
              )}
              {!loading && displayedNotifications.length === 0 && (
                <Collapse key="empty" timeout={300}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    {showOnlyUnread ? t('no_unread') : t('empty')}
                  </Typography>
                </Collapse>
              )}
              {!loading && displayedNotifications.length > 0 && (
                <Collapse key="list" timeout={300}>
                  <TransitionGroup component={null}>
                    {displayedNotifications.map((n, index) => (
                      <Collapse key={n.id} timeout={300}>
                        <NotificationItem
                          notification={n}
                          divider={index < displayedNotifications.length - 1}
                          onMarkAsRead={handleMarkAsRead}
                          onEventNameClick={handleEventNameClick}
                        />
                      </Collapse>
                    ))}
                  </TransitionGroup>
                </Collapse>
              )}
            </TransitionGroup>
          </Box>
        </Box>
      </Popover>
      {eventDetailsAnchor != null && eventDetailsEvent != null && (
        <EventDetailsPopover
          open
          anchorEl={eventDetailsAnchor}
          event={eventDetailsEvent}
          assets={eventDetailsAssets}
          showAssetCard
          onClose={handleEventDetailsClose}
          onEdit={handleEditFromDetails}
          locale={locale}
        />
      )}
      {editPopoverAnchor != null && editingEvent != null && (
        <CreateEventPopover
          open
          anchorEl={editPopoverAnchor}
          onClose={handleEditPopoverClose}
          initialDate={new Date(editingEvent.start)}
          assets={editingAssets}
          locale={locale}
          mode="edit"
          event={editingEvent}
          onSuccess={() => {
            handleEditPopoverClose();
          }}
          onDeleteSuccess={() => {
            handleEditPopoverClose();
          }}
        />
      )}
    </>
  );
}
