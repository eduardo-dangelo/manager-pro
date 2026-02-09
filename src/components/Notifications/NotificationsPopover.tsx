'use client';

import type { Notification } from './types';
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
  if (totalMinutes < 1) {
    return 'Less than 1 minute';
  }
  if (totalMinutes < 60) {
    return totalMinutes === 1 ? '1 minute' : `${totalMinutes} minutes`;
  }
  const totalHours = totalMinutes / 60;
  if (totalHours < 24) {
    const hours = Math.floor(totalHours);
    const mins = Math.round(totalMinutes - hours * 60);
    const h = hours === 1 ? '1 hour' : `${hours} hours`;
    if (mins === 0) {
      return h;
    }
    const m = mins === 1 ? '1 minute' : `${mins} minutes`;
    return `${h} and ${m}`;
  }
  const totalDays = totalHours / 24;
  const days = Math.floor(totalDays);
  const hours = Math.round(totalHours - days * 24);
  const d = days === 1 ? '1 day' : `${days} days`;
  if (hours === 0) {
    return d;
  }
  const h = hours === 1 ? '1 hour' : `${hours} hours`;
  return `${d} and ${h}`;
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

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/${locale}/api/notifications`);
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { notifications: Notification[] };
      setNotifications(data.notifications ?? []);
      onRefetch?.(data.notifications ?? []);
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

  return (
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
                            // px: 1,
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
                            n.type === 'event_reminder' && n.metadata
                              ? (
                                  <>
                                    Reminder:
                                    {' '}
                                    <Typography component="span" variant="body2" fontWeight={600}>
                                      {getEventNameFromNotification(n)}
                                    </Typography>
                                  </>
                                )
                              : n.title
                          }
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondary={
                            n.type === 'event_reminder' && n.metadata
                              ? (
                                  <>
                                    <Typography component="span" display="block" variant="body2" color="text.secondary">
                                      {formatTimeRemaining(
                                        new Date(
                                          new Date(n.createdAt).getTime()
                                            + (n.metadata.reminderMinutes ?? 0) * 60 * 1000,
                                        ),
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
                  ))}
                </TransitionGroup>
              </Collapse>
            )}
          </TransitionGroup>
        </Box>
      </Box>
    </Popover>
  );
}
