'use client';

import type { Notification } from './types';
import { Box, ListItem, ListItemText, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

const UNREAD_DOT_SIZE = 8;
const UNREAD_DOT_GAP = 10;
const HOVER_PANEL_DELAY_MS = 300;
const HOVER_PANEL_WIDTH = 90;
const HOVER_PANEL_TRANSITION_MS = 200;

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

type NotificationItemProps = {
  notification: Notification;
  divider: boolean;
  onMarkAsRead: (n: Notification) => void;
  onEventNameClick: (e: React.MouseEvent<HTMLElement>, n: Notification) => void;
};

export function NotificationItem({
  notification: n,
  divider,
  onMarkAsRead,
  onEventNameClick,
}: NotificationItemProps) {
  const t = useTranslations('Notifications');
  const [isHovered, setIsHovered] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isUnread = !n.read;
  const isReminder = n.type === 'event_reminder' && n.metadata;

  useEffect(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (!isHovered || !isUnread) {
      setShowPanel(false);
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setShowPanel(true);
    }, HOVER_PANEL_DELAY_MS);
    hoverTimeoutRef.current = timeoutId;

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isHovered, isUnread]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleClick = () => void onMarkAsRead(n);

  return (
    <ListItem
      alignItems="flex-start"
      disablePadding
      divider={divider}
      sx={{
        'py': 1,
        'px': 1,
        'display': 'flex',
        'alignItems': 'flex-start',
        'gap': 1,
        'cursor': n.read ? 'default' : 'pointer',
        'bgcolor': !n.read ? 'transparent' : 'action.hover',
        'position': 'relative',
        'overflow': 'hidden',
        '&:hover': {
          bgcolor: n.read ? 'action.selected' : 'action.hover',
        },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {isUnread && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: showPanel ? HOVER_PANEL_WIDTH : 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            bgcolor: 'action.hover',
            transition: `width ${HOVER_PANEL_TRANSITION_MS}ms ease-in-out`,
            zIndex: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              whiteSpace: 'nowrap',
              color: 'text.secondary',
              p: 1.5,
              minWidth: HOVER_PANEL_WIDTH,
              textAlign: 'right',
            }}
          >
            {t('mark_as_read')}
          </Typography>
        </Box>
      )}
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
        {isUnread && (
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
                    onClick={e => onEventNameClick(e, n)}
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
  );
}
