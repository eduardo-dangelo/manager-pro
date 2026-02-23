'use client';

import {
  Add as AddIcon,
  CalendarMonth as EventIcon,
  Description as DocIcon,
  Edit as EditIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import LinkNext from 'next/link';
import { Card } from '@/components/common/Card';
import type { Activity } from './types';

const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    person: 'persons',
    project: 'projects',
    trip: 'trips',
    custom: 'customs',
  };
  return pluralMap[type] || `${type}s`;
};

function getActionIcon(action: Activity['action']) {
  switch (action) {
    case 'asset_created':
      return AddIcon;
    case 'asset_updated':
      return EditIcon;
    case 'event_created':
    case 'event_updated':
    case 'event_deleted':
      return EventIcon;
    case 'doc_uploaded':
      return DocIcon;
    case 'image_uploaded':
      return ImageIcon;
    default:
      return EditIcon;
  }
}

function getActionColor(action: Activity['action']) {
  switch (action) {
    case 'asset_created':
      return 'success.light';
    case 'event_deleted':
      return 'error.light';
    default:
      return 'primary.main';
  }
}

type ActivityItemProps = {
  activity: Activity;
  showAssetLink?: boolean;
  locale: string;
  isLast?: boolean;
};

export function ActivityItem({ activity, showAssetLink, locale, isLast }: ActivityItemProps) {
  const t = useTranslations('Activity');
  const Icon = getActionIcon(activity.action);
  const color = getActionColor(activity.action);

  let label = t(activity.action);

  const meta = activity.metadata as { eventName?: string; fileName?: string } | undefined;
  if (meta?.eventName) {
    label = `${label}: ${meta.eventName}`;
  } else if (meta?.fileName) {
    label = `${label}: ${meta.fileName}`;
  }

  const assetHref
    = showAssetLink && activity.assetType
      ? `/${locale}/assets/${pluralizeType(activity.assetType)}/${activity.assetId}`
      : null;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        gap: 1,
        pb: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            borderRadius: '50%',
            color,
            zIndex: 1,
            border: '1px solid',
            borderColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
          }}
        >
          <Icon sx={{ fontSize: 16 }} />
        </Box>
        <Box
          sx={{
            width: '1px',
            height: '100%',
            backgroundColor: isLast ? 'transparent' : 'divider',
            borderRadius: 2,
          }}
        />
      </Box>
      <Card sx={{ py: 1, px: 2, flex: 1, mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </Typography>
          {assetHref && activity.assetName && (
            <Link
              component={LinkNext}
              href={assetHref}
              variant="caption"
              sx={{ fontWeight: 500 }}
            >
              {activity.assetName}
            </Link>
          )}
        </Box>
      </Card>
    </Box>
  );
}
