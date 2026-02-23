'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ActivityTimeline } from '@/components/Activity';
import { useSetBreadcrumb } from '@/components/BreadcrumbContext';
import { useGetActivities } from '@/queries/hooks/activities/useGetActivities';

type ActivityClientProps = {
  locale: string;
};

export function ActivityClient({ locale }: ActivityClientProps) {
  const dashboardT = useTranslations('DashboardLayout');

  const { data: activities = [], isLoading, error } = useGetActivities(locale);

  useSetBreadcrumb([
    { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
    { label: dashboardT('menu_activity'), href: `/${locale}/activity` },
  ]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error instanceof Error ? error.message : 'Failed to load'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        {dashboardT('menu_activity')}
      </Typography>
      <ActivityTimeline
        activities={activities}
        showAssetLink
        locale={locale}
      />
    </Box>
  );
}
