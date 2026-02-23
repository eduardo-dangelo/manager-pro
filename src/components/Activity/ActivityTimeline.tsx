'use client';

import { Box, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Activity } from './types';
import { ActivityItem } from './ActivityItem';

type ActivityTimelineProps = {
  activities: Activity[];
  showAssetLink?: boolean;
  locale: string;
  emptyMessage?: string;
};

export function ActivityTimeline({
  activities,
  showAssetLink = false,
  locale,
  emptyMessage,
}: ActivityTimelineProps) {
  const t = useTranslations('Activity');
  const defaultEmpty = t('no_activities');

  if (activities.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }} elevation={1}>
        <Typography color="text.secondary">
          {emptyMessage ?? defaultEmpty}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          showAssetLink={showAssetLink}
          locale={locale}
          isLast={index === activities.length - 1}
        />
      ))}
    </Box>
  );
}
