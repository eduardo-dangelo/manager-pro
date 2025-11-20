'use client';

import { SignOutButton, useUser } from '@clerk/nextjs';
import {
  DarkMode,
  LightMode,
  Logout,
  Settings,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getI18nPath } from '@/utils/Helpers';
import { useThemeMode } from './ThemeProvider';

const DRAWER_WIDTH = 230;

export function GlobalTopbar() {
  const { user } = useUser();
  const theme = useTheme();
  const pathname = usePathname();
  const t = useTranslations('GlobalTopbar');

  // Extract locale from pathname
  const locale = pathname?.match(/^\/([a-z]{2})\//)?.[1] || 'en';

  // Get theme mode from ThemeProvider
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        left: { xs: 0, lg: DRAWER_WIDTH },
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        py: 2,
        bgcolor: theme.palette.background.default,
        zIndex: theme.zIndex.appBar - 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Theme Switcher */}
        <Tooltip title={mode === 'light' ? t('tooltip_dark_mode') : t('tooltip_light_mode')}>
          <IconButton
            onClick={toggleTheme}
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
            component={Link}
            href={getI18nPath('/user-profile', locale)}
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
          <SignOutButton>
            <IconButton
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
    </Box>
  );
}
