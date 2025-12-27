'use client';

import {
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Breadcrumb } from './Breadcrumb';
import { useBreadcrumb } from './BreadcrumbContext';
import { useGlobalTopbarContent } from './GlobalTopbarContentContext';
import { TopbarActions } from './TopbarActions';

const DRAWER_WIDTH = 230;

export function GlobalTopbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Get breadcrumb items from context
  const { items: breadcrumbItems } = useBreadcrumb();

  // Get registered right content (e.g., AssetsTopBar controls on mobile)
  const { rightContent } = useGlobalTopbarContent();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: isMobile ? 56 : 0, // Account for mobile AppBar height
        left: { xs: 0, lg: DRAWER_WIDTH },
        right: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: { xs: 0, md: 2 },
        bgcolor: theme.palette.background.default,
        zIndex: theme.zIndex.appBar - 1,
        gap: 1,
      }}
    >
      {/* Breadcrumb - left side, can wrap below on small screens */}
      {breadcrumbItems.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            minWidth: 0, // Allow shrinking
            overflow: 'hidden',
            py: 1,
          }}
        >
          <Breadcrumb items={breadcrumbItems} />
        </Box>
      )}

      {/* Registered right content (e.g., AssetsTopBar controls on mobile) */}
      {rightContent && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {rightContent}
        </Box>
      )}

      {/* Actions - right side, only on desktop when no registered content */}
      {!rightContent && (
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', flexShrink: 0 }}>
          <TopbarActions />
        </Box>
      )}
    </Box>
  );
}
