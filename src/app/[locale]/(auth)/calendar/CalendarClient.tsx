'use client';

import type { CalendarViewMode } from '@/components/Calendar/types';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSetBreadcrumb } from '@/components/BreadcrumbContext';
import { CalendarView } from '@/components/Calendar';
import { useGetAssets } from '@/queries/hooks/assets';
import { useGetCalendarEvents } from '@/queries/hooks/calendar-events';
import { calendarEventKeys } from '@/queries/keys';

type CalendarClientProps = {
  locale: string;
  defaultView?: CalendarViewMode;
  initialDate?: Date;
};

export function CalendarClient({ locale, defaultView, initialDate }: CalendarClientProps) {
  const dashboardT = useTranslations('DashboardLayout');
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: loading, error: queryError } = useGetCalendarEvents(locale);
  const { data: assets = [] } = useGetAssets(locale);

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load') : null;

  const handleEventsChange = () => {
    queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
  };

  useSetBreadcrumb([
    { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
    { label: dashboardT('menu_calendar'), href: `/${locale}/calendar` },
  ]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        {dashboardT('menu_calendar')}
      </Typography>
      <CalendarView
        events={events}
        locale={locale}
        assets={assets}
        onEventsChange={handleEventsChange}
        defaultView={defaultView}
        initialDate={initialDate}
      />
    </Box>
  );
}
