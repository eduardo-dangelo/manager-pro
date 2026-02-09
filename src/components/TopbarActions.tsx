'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import {
  DarkMode,
  LightMode,
  Logout,
  Notifications as NotificationsIcon,
  Settings,
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useNotificationsRefetch } from '@/contexts/NotificationsRefetchContext';
import { useHoverSound } from '@/hooks/useHoverSound';
import { getI18nPath } from '@/utils/Helpers';
import type { Notification } from './Notifications/types';
import { NotificationsPopover } from './Notifications/NotificationsPopover';
import { useThemeMode } from './ThemeProvider';
import { UserProfileModal } from './UserProfileModal';

export function TopbarActions() {
  const { user } = useUser();
  const pathname = usePathname();
  const t = useTranslations('GlobalTopbar');

  // Extract locale from pathname
  const locale = pathname?.match(/^\/([a-z]{2})\//)?.[1] || 'en';

  // Get theme mode from ThemeProvider
  const { mode, toggleTheme } = useThemeMode();
  const { playHoverSound } = useHoverSound();
  const { registerRefetch } = useNotificationsRefetch();
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/${locale}/api/notifications`);
      if (!res.ok) return;
      const data = (await res.json()) as { notifications: Notification[] };
      setNotifications(data.notifications ?? []);
    } catch {
      // ignore
    }
  }, [locale]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    registerRefetch(fetchNotifications);
  }, [registerRefetch, fetchNotifications]);

  useEffect(() => {
    const handleFocus = () => {
      void fetchNotifications();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchNotifications]);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Notifications */}
        <Tooltip title={t('tooltip_notifications')}>
          <Badge
            badgeContent={unreadCount}
            color="error"
            invisible={unreadCount === 0}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <IconButton
              onClick={(e) => setNotificationsAnchorEl(e.currentTarget)}
              onMouseEnter={playHoverSound}
              size="small"
              sx={{
                'color': 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Badge>
        </Tooltip>

        {/* Theme Switcher */}
        <Tooltip title={mode === 'light' ? t('tooltip_dark_mode') : t('tooltip_light_mode')}>
          <IconButton
            onClick={toggleTheme}
            onMouseEnter={playHoverSound}
            size="small"
            sx={{
              'color': 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* User Avatar */}
        <Tooltip title={t('tooltip_user_profile')}>
          <IconButton
            onClick={() => setUserProfileModalOpen(true)}
            onMouseEnter={playHoverSound}
            size="small"
            sx={{
              'p': 0,
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Avatar
              src={user?.imageUrl}
              alt={user?.firstName || 'User'}
              sx={{
                width: 26,
                height: 26,
              }}
            >
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || 'U'}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* Settings */}
        <Tooltip title={t('tooltip_settings')}>
          <IconButton
            component={Link}
            href={getI18nPath('/settings', locale)}
            onMouseEnter={playHoverSound}
            size="small"
            sx={{
              'color': 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Logout */}
        <Tooltip title={t('tooltip_logout')}>
          {/* eslint-disable-next-line react/component-name-casing */}
          <SignOutButton>
            <IconButton
              onMouseEnter={playHoverSound}
              size="small"
              sx={{
                'color': 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </SignOutButton>
        </Tooltip>
      </Box>

      {/* Notifications Popover */}
      <NotificationsPopover
        open={Boolean(notificationsAnchorEl)}
        anchorEl={notificationsAnchorEl}
        onClose={() => setNotificationsAnchorEl(null)}
        locale={locale}
        onRefetch={setNotifications}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        open={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
      />
    </>
  );
}

