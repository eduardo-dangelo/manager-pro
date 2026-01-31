'use client';

import type { CalendarEvent } from '@/components/Calendar/types';
import type { Asset } from '@/components/Assets/utils';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useSetBreadcrumb } from '@/components/BreadcrumbContext';
import { CalendarView } from '@/components/Calendar';

type CalendarClientProps = {
  locale: string;
};

export function CalendarClient({ locale }: CalendarClientProps) {
  const dashboardT = useTranslations('DashboardLayout');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSetBreadcrumb([
    { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
    { label: dashboardT('menu_calendar'), href: `/${locale}/calendar` },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, assetsRes] = await Promise.all([
        fetch(`/${locale}/api/calendar-events`),
        fetch(`/${locale}/api/assets`),
      ]);
      if (!eventsRes.ok) {
        throw new Error('Failed to fetch events');
      }
      if (!assetsRes.ok) {
        throw new Error('Failed to fetch assets');
      }
      const eventsData = (await eventsRes.json()) as { events: CalendarEvent[] };
      const assetsData = (await assetsRes.json()) as { assets: Asset[] };
      setEvents(eventsData.events ?? []);
      setAssets(assetsData.assets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setEvents([]);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        onEventsChange={setEvents}
      />
    </Box>
  );
}
