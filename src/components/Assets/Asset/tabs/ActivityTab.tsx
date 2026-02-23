'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { ActivityTimeline } from '@/components/Activity';
import { useGetActivities } from '@/queries/hooks/activities/useGetActivities';

type Asset = {
  id: number;
  name: string;
  type?: string | null;
};

type ActivityTabProps = {
  asset: Asset;
  locale: string;
};

export function ActivityTab({ asset, locale }: ActivityTabProps) {
  const { data: activities = [], isLoading, error } = useGetActivities(locale, asset.id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
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
    <ActivityTimeline
      activities={activities}
      showAssetLink={false}
      locale={locale}
    />
  );
}
