'use client';

import type { Notification } from './types';
import type { Asset } from '@/components/Assets/utils';
import type { CalendarEvent } from '@/components/Calendar/types';
import {
  Box,
  Collapse,
  FormControlLabel,
  ListItem,
  ListItemText,
  Switch,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { CreateEventPopover } from '@/components/Calendar/CreateEventPopover';
import { EventDetailsPopover } from '@/components/Calendar/EventDetailsPopover';
import { Popover } from '@/components/common/Popover';

const POPOVER_WIDTH = 360;

/** Format time until (or since) a target date for display in reminder notifications. */
function formatTimeRemaining(eventStart: Date, now: Date = new Date()): string {
  const ms = eventStart.getTime() - now.getTime();
  if (ms < 0) {
    const ago = formatDistanceToNow(eventStart, { addSuffix: true });
    return `Started ${ago.replace(' ago', '')} ago`;
  }
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const prefix = 'in ';
  if (totalMinutes < 1) {
    return 'in less than 1 minute';
  }
  if (totalMinutes < 60) {
    const text = totalMinutes === 1 ? '1 minute' : `${totalMinutes} minutes`;
    return `${prefix}${text}`;
  }
  const totalHours = totalMinutes / 60;
  if (totalHours < 24) {
    const hours = Math.floor(totalHours);
    const mins = Math.round(totalMinutes - hours * 60);
    const h = hours === 1 ? '1 hour' : `${hours} hours`;
    if (mins === 0) {
      return `${prefix}${h}`;
    }
    const m = mins === 1 ? '1 minute' : `${mins} minutes`;
    return `${prefix}${h} and ${m}`;
  }
  const totalDays = totalHours / 24;
  const days = Math.floor(totalDays);
  const hours = Math.round(totalHours - days * 24);
  const d = days === 1 ? '1 day' : `${days} days`;
  if (hours === 0) {
    return `${prefix}${d}`;
  }
  const h = hours === 1 ? '1 hour' : `${hours} hours`;
  return `${prefix}${d} and ${h}`;
}

function getEventNameFromNotification(n: Notification): string {
  if (n.metadata?.eventName) {
    return n.metadata.eventName;
  }
  const match = n.title.match(/Reminder:\s*"([^"]+)"/);
  return match?.[1] ?? 'Event';
}

const POPOVER_MAX_HEIGHT = 400;
const UNREAD_DOT_SIZE = 8;
const UNREAD_DOT_GAP = 10;

type NotificationsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  locale: string;
  onRefetch?: (notifications: Notification[]) => void;
};

export function NotificationsPopover({
  open,
  anchorEl,
  onClose,
  locale,
  onRefetch,
}: NotificationsPopoverProps) {
  const t = useTranslations('Notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(true);
  const [eventDetailsAnchor, setEventDetailsAnchor] = useState<HTMLElement | null>(null);
  const [eventDetailsEvent, setEventDetailsEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailsAssets, setEventDetailsAssets] = useState<Asset[]>([]);
  const [editPopoverAnchor, setEditPopoverAnchor] = useState<HTMLElement | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingAssets, setEditingAssets] = useState<Asset[]>([]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/${locale}/api/notifications`);
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { notifications: Notification[] };
      const list = data.notifications ?? [];
      setNotifications(list);
      onRefetch?.(list);
    } finally {
      setLoading(false);
    }
  }, [locale, onRefetch]);

  useEffect(() => {
    if (open) {
      void fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const displayedNotifications = showOnlyUnread
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleMarkAsRead = useCallback(
    async (n: Notification) => {
      if (n.read) {
        return;
      }
      const res = await fetch(`/${locale}/api/notifications/${n.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        return;
      }
      const updatedList = notifications.map(notif =>
        notif.id === n.id ? { ...notif, read: true } : notif,
      );
      setNotifications(updatedList);
      onRefetch?.(updatedList);
    },
    [locale, notifications, onRefetch],
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
        const [eventRes, assetsRes] = await Promise.all([
          fetch(`/${locale}/api/calendar-events/${eventId}`),
          fetch(`/${locale}/api/assets`),
        ]);
        if (!eventRes.ok || !assetsRes.ok) {
          setEventDetailsAnchor(null);
          return;
        }
        const eventData = (await eventRes.json()) as { event: CalendarEvent };
        const assetsData = (await assetsRes.json()) as { assets: Asset[] };
        setEventDetailsEvent(eventData.event);
        setEventDetailsAssets(assetsData.assets ?? []);
      } catch {
        setEventDetailsAnchor(null);
      }
    },
    [locale],
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
                    {displayedNotifications.map((n, index) => {
                      const isReminder = n.type === 'event_reminder' && n.metadata;
                      return (
                        <Collapse key={n.id} timeout={300}>
                          <ListItem
                            alignItems="flex-start"
                            disablePadding
                            divider={index < displayedNotifications.length - 1}
                            sx={{
                              'py': 1,
                              'px': 1,
                              'display': 'flex',
                              'alignItems': 'flex-start',
                              'gap': 1,
                              'cursor': n.read ? 'default' : 'pointer',
                              'bgcolor': !n.read ? 'transparent' : 'action.hover',
                              '&:hover': {
                                bgcolor: n.read ? 'action.selected' : 'action.hover',
                              },
                            }}
                            onClick={() => void handleMarkAsRead(n)}
                          >
                            <Box
                              sx={{
                                width: UNREAD_DOT_SIZE + UNREAD_DOT_GAP,
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                pt: 0.75,
                                mt: 0.5,
                              }}
                            >
                              {!n.read && (
                                <Box
                                  sx={{
                                    width: UNREAD_DOT_SIZE,
                                    height: UNREAD_DOT_SIZE,
                                    borderRadius: '50%',
                                    bgcolor: 'error.main',
                                  }}
                                />
                              )}
                            </Box>
                            <ListItemText
                              primary={
                                isReminder
                                  ? (
                                      <>
                                        Reminder:
                                        {' '}
                                        <Typography
                                          component="span"
                                          variant="body2"
                                          fontWeight={600}
                                          onClick={e => handleEventNameClick(e, n)}
                                          sx={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                                        >
                                          {getEventNameFromNotification(n)}
                                        </Typography>
                                      </>
                                    )
                                  : n.title
                              }
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondary={
                                isReminder && n.metadata
                                  ? (
                                      <>
                                        <Typography component="span" display="block" variant="body2" color="text.secondary">
                                          {formatTimeRemaining(
                                            new Date(
                                              new Date(n.createdAt).getTime()
                                                + (n.metadata.reminderMinutes ?? 0) * 60 * 1000,
                                            ),
                                            new Date(n.createdAt),
                                          )}
                                        </Typography>
                                        <Typography component="span" display="block" variant="caption" color="text.secondary">
                                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </Typography>
                                      </>
                                    )
                                  : formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                              }
                              secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                              sx={{ flex: 1, minWidth: 0 }}
                            />
                          </ListItem>
                        </Collapse>
                      );
                    })}
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
            void fetchNotifications();
          }}
          onDeleteSuccess={() => {
            handleEditPopoverClose();
            void fetchNotifications();
          }}
        />
      )}
    </>
  );
}
