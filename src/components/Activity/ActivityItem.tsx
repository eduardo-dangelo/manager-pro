'use client';

import type { Activity } from './types';
import type { CalendarEvent as CalendarEventType } from '@/components/Calendar/types';
import {
  History as ActivityIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  DeleteOutline as DeleteIcon,
  Description as DocIcon,
  Folder as DocsIcon,
  Edit as EditIcon,
  CalendarMonth as EventIcon,
  InsertDriveFile as FileIcon,
  Timeline as FinanceIcon,
  PhotoLibrary as GalleryIcon,
  Image as ImageIcon,
  ListAlt as ListingIcon,
  OpenInNew as OpenInNewIcon,
  Dashboard as OverviewIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Box, Button, Paper, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import LinkNext from 'next/link';
import { useState } from 'react';
import { CalendarEvent } from '@/components/Calendar/CalendarEvent';
import { areAssetFieldValuesEqual, stableJsonForActivityKey } from '@/lib/assetUpdateDiff';

const EVENT_CHANGE_DATETIME_FORMAT = 'd MMM HH:mm';

function minutesToDurationParts(totalMinutes: number): { days: number; hours: number; minutes: number } {
  const days = Math.floor(totalMinutes / 1440);
  const remainder = totalMinutes % 1440;
  const hours = Math.floor(remainder / 60);
  const minutes = remainder % 60;
  return { days, hours, minutes };
}

function formatReminderDuration(
  totalMinutes: number,
  t: (key: string, values?: Record<string, number>) => string,
): string {
  const { days, hours, minutes } = minutesToDurationParts(totalMinutes);
  const parts: string[] = [];
  if (days > 0) {
    parts.push(t('duration_days', { count: days }));
  }
  if (hours > 0) {
    parts.push(t('duration_hours', { count: hours }));
  }
  if (minutes > 0) {
    parts.push(t('duration_minutes', { count: minutes }));
  }
  return parts.length > 0 ? parts.join(', ') : t('duration_minutes', { count: 0 });
}

const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    person: 'persons',
  };
  return pluralMap[type] || `${type}s`;
};

function getAssetFieldLabel(
  field: string,
  tActivity: (key: string) => string,
  tAssets: (key: string) => string,
): string {
  const top: Record<string, string> = {
    'address': 'field_address',
    'color': 'field_color',
    'description': 'field_description',
    'metadata.dvla': 'field_metadata_dvla',
    'metadata.maintenance': 'field_metadata_maintenance',
    'metadata.mot': 'field_metadata_mot',
    'name': 'field_name',
    'registrationNumber': 'field_registrationNumber',
    'status': 'field_status',
    'tabs': 'field_tabs',
  };
  const actKey = top[field];
  if (actKey) {
    return tActivity(actKey);
  }
  if (field.startsWith('metadata.specs.')) {
    const k = field.slice('metadata.specs.'.length);
    const specToAssets: Record<string, string> = {
      color: 'vehicle_color',
      cost: 'vehicle_cost',
      driveTrain: 'vehicle_drive_train',
      engineNumber: 'vehicle_engine_number',
      engineSize: 'vehicle_engine_size',
      fuel: 'vehicle_fuel',
      make: 'vehicle_make',
      mileage: 'vehicle_mileage',
      model: 'vehicle_model',
      motStatus: 'vehicle_mot_status',
      registration: 'vehicle_registration',
      seats: 'vehicle_seats',
      taxStatus: 'vehicle_tax_status',
      transmission: 'vehicle_transmission',
      vin: 'vehicle_vin',
      weight: 'vehicle_weight',
      year: 'vehicle_year',
    };
    const assetsKey = specToAssets[k];
    if (assetsKey) {
      return tAssets(assetsKey);
    }
    return k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
  }
  return field;
}

function isColorField(field: string): boolean {
  return field === 'color' || field.endsWith('.color');
}

function formatScalarForActivity(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  try {
    const s = JSON.stringify(value);
    return s.length > 160 ? `${s.slice(0, 160)}…` : s;
  } catch {
    return String(value);
  }
}

type AssetChangeRow = { field: string; before: unknown; after: unknown };

function assetChangeRowKey(activity: Activity, ch: AssetChangeRow): string {
  return `${activity.id}-${activity.createdAt}-${ch.field}-${stableJsonForActivityKey(ch.before)}-${stableJsonForActivityKey(ch.after)}`;
}

function formatAssetChangeValue(
  value: unknown,
  field: string,
  tActivity: (key: string) => string,
): React.ReactNode {
  if (value === 'blob_updated') {
    return tActivity('metadata_section_updated');
  }
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (isColorField(field) && typeof value === 'string' && value.trim().startsWith('#')) {
    const hex = value.trim();
    const swatchSx = {
      width: 12,
      height: 12,
      borderRadius: '50%',
      border: '1px solid',
      borderColor: 'divider',
      display: 'inline-block',
      verticalAlign: 'middle',
    } as const;
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Box component="span" sx={{ ...swatchSx, bgcolor: hex }} />
        <Box component="span">{hex}</Box>
      </Box>
    );
  }
  return formatScalarForActivity(value);
}

type AssetChangeSentenceLayout = 'inline' | 'stack';
type EventChangeRow = { field: string; before: unknown; after: unknown };

function renderAssetChangeSentence(
  ch: AssetChangeRow,
  tActivity: (key: string) => string,
  tAssets: (key: string) => string,
  layout: AssetChangeSentenceLayout,
): React.ReactNode {
  const propertyLabel = getAssetFieldLabel(ch.field, tActivity, tAssets);
  const inner = (
    <>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {propertyLabel}
      </Box>
      {' '}
      {tActivity('change_from')}
      {' '}
      <Box component="span" sx={{ fontWeight: 600 }}>
        {formatAssetChangeValue(ch.before, ch.field, tActivity)}
      </Box>
      {' '}
      {tActivity('change_to')}
      {' '}
      <Box component="span" sx={{ fontWeight: 600 }}>
        {formatAssetChangeValue(ch.after, ch.field, tActivity)}
      </Box>
    </>
  );

  if (layout === 'stack') {
    return (
      <Typography variant="caption" component="div" color="text.primary" sx={{ fontWeight: 400 }}>
        {inner}
      </Typography>
    );
  }

  return (
    <Typography variant="caption" component="span" color="text.primary" sx={{ fontWeight: 400, display: 'inline' }}>
      {inner}
    </Typography>
  );
}

function eventChangeRowKey(activity: Activity, ch: EventChangeRow): string {
  return `${activity.id}-${activity.createdAt}-event-${ch.field}-${stableJsonForActivityKey(ch.before)}-${stableJsonForActivityKey(ch.after)}`;
}

function getEventFieldLabel(field: string, tActivity: (key: string) => string): string {
  const labels: Record<string, string> = {
    name: 'field_name',
    description: 'field_description',
    color: 'field_color',
    location: 'event_field_location',
    start: 'event_field_start',
    end: 'event_field_end',
    asset: 'event_field_asset',
  };
  return tActivity(labels[field] ?? field);
}

function formatEventChangeValue(
  value: unknown,
  field: string,
): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if ((field === 'start' || field === 'end') && typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return format(date, EVENT_CHANGE_DATETIME_FORMAT);
    }
  }
  if (field === 'color' && typeof value === 'string' && value.trim().startsWith('#')) {
    const hex = value.trim();
    const swatchSx = {
      width: 12,
      height: 12,
      borderRadius: '50%',
      border: '1px solid',
      borderColor: 'divider',
      display: 'inline-block',
      verticalAlign: 'middle',
    } as const;
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Box component="span" sx={{ ...swatchSx, bgcolor: hex }} />
        <Box component="span">{hex}</Box>
      </Box>
    );
  }
  if (field === 'description' && typeof value === 'string') {
    const maxLen = 80;
    return value.length > maxLen ? `${value.slice(0, maxLen)}…` : value;
  }
  return formatScalarForActivity(value) || '—';
}

function renderEventChangeSentence(
  ch: EventChangeRow,
  tActivity: (key: string) => string,
  layout: AssetChangeSentenceLayout,
): React.ReactNode {
  const propertyLabel = getEventFieldLabel(ch.field, tActivity);
  const inner = (
    <>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {propertyLabel}
      </Box>
      {' '}
      {tActivity('change_from')}
      {' '}
      <Box component="span" sx={{ fontWeight: 600 }}>
        {formatEventChangeValue(ch.before, ch.field)}
      </Box>
      {' '}
      {tActivity('change_to')}
      {' '}
      <Box component="span" sx={{ fontWeight: 600 }}>
        {formatEventChangeValue(ch.after, ch.field)}
      </Box>
    </>
  );

  if (layout === 'stack') {
    return (
      <Typography variant="caption" component="div" color="text.primary" sx={{ fontWeight: 400 }}>
        {inner}
      </Typography>
    );
  }

  return (
    <Typography variant="caption" component="span" color="text.primary" sx={{ fontWeight: 400, display: 'inline' }}>
      {inner}
    </Typography>
  );
}

function getTabIcon(tabName: string) {
  switch (tabName) {
    case 'overview':
      return OverviewIcon;
    case 'calendar':
      return CalendarIcon;
    case 'finance':
      return FinanceIcon;
    case 'docs':
      return DocsIcon;
    case 'gallery':
      return GalleryIcon;
    case 'listing':
      return ListingIcon;
    case 'activity':
    case 'timeline':
      return ActivityIcon;
    default:
      return OverviewIcon;
  }
}

function getActionIcon(action: Activity['action'], _tabName?: string) {
  // if (tabName && (action === 'tab_added' || action === 'tab_moved' || action === 'tab_removed')) {
  //   return getTabIcon(tabName);
  // }
  switch (action) {
    case 'event_deleted':
    case 'doc_deleted':
    case 'doc_folder_deleted':
    case 'image_deleted':
    case 'tab_removed':
      return DeleteIcon;
    case 'asset_created':
      return AddIcon;
    case 'asset_updated':
      return EditIcon;
    case 'vehicle_data_refreshed':
      return RefreshIcon;
    case 'event_created':
    case 'event_updated':
    case 'event_reminder_added':
      return EventIcon;
    case 'doc_uploaded':
    case 'doc_renamed':
    case 'doc_moved':
      return DocIcon;
    case 'doc_folder_created':
    case 'doc_folder_moved':
    case 'doc_folder_renamed':
      return DocsIcon;
    case 'image_uploaded':
      return ImageIcon;
    case 'tab_added':
    case 'tab_moved':
      return OverviewIcon;
    default:
      return EditIcon;
  }
}

// Reserved for potential future severity-based styling.
// function getActionSeverity(action: Activity['action']): 'success' | 'info' | 'error' {
//   switch (action) {
//     case 'asset_created':
//     case 'event_created':
//     case 'doc_uploaded':
//     case 'image_uploaded':
//     case 'tab_added':
//       return 'success';
//     case 'asset_updated':
//     case 'event_updated':
//     case 'doc_renamed':
//     case 'doc_folder_renamed':
//     case 'tab_moved':
//       return 'info';
//     case 'event_deleted':
//     case 'doc_deleted':
//     case 'image_deleted':
//     case 'doc_folder_deleted':
//     case 'tab_removed':
//       return 'error';
//     default:
//       return 'info';
//   }
// }

type ActivityItemProps = {
  activity: Activity;
  showAssetLink?: boolean;
  locale: string;
  isLast?: boolean;
  onFileClick?: (item: { id: string; name: string; url: string }, type: 'pdf' | 'image') => void;
  onEventClick?: (eventId: number, anchorEl: HTMLElement) => void;
};

export function ActivityItem({
  activity,
  showAssetLink,
  locale,
  isLast,
  onFileClick,
  onEventClick,
}: ActivityItemProps) {
  const t = useTranslations('Activity');
  const tAssets = useTranslations('Assets');
  const [assetChangesAnchorEl, setAssetChangesAnchorEl] = useState<HTMLElement | null>(null);
  const [eventChangesAnchorEl, setEventChangesAnchorEl] = useState<HTMLElement | null>(null);
  const Icon = getActionIcon(activity.action, (activity.metadata as { tabName?: string })?.tabName);

  const userDisplayName = [activity.userFirstName, activity.userLastName].filter(Boolean).join(' ');
  const actionLabel = t(activity.action);
  const byUserLabel = userDisplayName ? t('by_user', { userName: userDisplayName }) : null; // Line 1: "by John Doe" or just "by John Doe"

  const meta = activity.metadata as {
    changes?: Array<{ field: string; before: unknown; after: unknown }>;
    registration?: string;
    eventName?: string;
    eventColor?: string | null;
    fileName?: string;
    fileId?: string;
    url?: string;
    oldName?: string;
    newName?: string;
    tabName?: string;
    fromIndex?: number;
    toIndex?: number;
    changeType?: string;
    oldStart?: string;
    newStart?: string;
    oldEnd?: string;
    newEnd?: string;
    oldDescription?: string;
    newDescription?: string;
    oldLocation?: string;
    newLocation?: string;
    oldColor?: string;
    newColor?: string;
    oldAssetId?: number;
    newAssetId?: number;
    oldAssetName?: string;
    newAssetName?: string;
    folderName?: string;
    folderId?: string;
    fromFolderId?: string | null;
    toFolderId?: string | null;
    fromFolderName?: string;
    toFolderName?: string;
    reminderMinutes?: number[];
  } | undefined;

  // Entity name (event name, file name, etc.) - for event_updated with changeType, entity is just the event name
  let entityName: string | null = null;
  let inlineChangeContent: React.ReactNode | null = null;

  if (meta?.eventName) {
    entityName = meta.eventName;
    if (activity.action === 'event_updated' && meta.changeType && (!Array.isArray(meta.changes) || meta.changes.length === 0)) {
      const ct = meta.changeType;
      const tStr = t as (k: string) => string;

      if (ct === 'renamed' && meta.oldName != null && meta.newName != null) {
        inlineChangeContent = t.rich('event_renamed', {
          oldName: meta.oldName,
          newName: meta.newName,
          bold: chunks => <Box component="span" sx={{ fontWeight: 600 }}>{chunks}</Box>,
        });
      } else if (ct === 'start_time_changed' && meta.oldStart && meta.newStart) {
        const boldChunks = (chunks: React.ReactNode) => <Box component="span" sx={{ fontWeight: 600 }}>{chunks}</Box>;
        inlineChangeContent = (
          <>
            {tStr('event_start_time_changed')}
            {' '}
            {t.rich('from_to_bold', {
              from: format(new Date(meta.oldStart), EVENT_CHANGE_DATETIME_FORMAT),
              to: format(new Date(meta.newStart), EVENT_CHANGE_DATETIME_FORMAT),
              bold: boldChunks,
            })}
          </>
        );
      } else if (ct === 'end_time_changed' && meta.oldEnd && meta.newEnd) {
        const boldChunks = (chunks: React.ReactNode) => <Box component="span" sx={{ fontWeight: 600 }}>{chunks}</Box>;
        inlineChangeContent = (
          <>
            {tStr('event_end_time_changed')}
            {' '}
            {t.rich('from_to_bold', {
              from: format(new Date(meta.oldEnd), EVENT_CHANGE_DATETIME_FORMAT),
              to: format(new Date(meta.newEnd), EVENT_CHANGE_DATETIME_FORMAT),
              bold: boldChunks,
            })}
          </>
        );
      } else if (ct === 'description_changed' && (meta.oldDescription != null || meta.newDescription != null)) {
        const fromVal = (meta.oldDescription ?? '').trim();
        const toVal = (meta.newDescription ?? '').trim();
        const maxLen = 80;
        const fromTrunc = fromVal.length > maxLen ? `${fromVal.slice(0, maxLen)}…` : fromVal;
        const toTrunc = toVal.length > maxLen ? `${toVal.slice(0, maxLen)}…` : toVal;
        const boldChunks = (chunks: React.ReactNode) => <Box component="span" sx={{ fontWeight: 600 }}>{chunks}</Box>;
        inlineChangeContent = (
          <>
            {tStr('event_description_changed')}
            {' '}
            {t.rich('from_to_bold', {
              from: fromTrunc || '—',
              to: toTrunc || '—',
              bold: boldChunks,
            })}
          </>
        );
      } else if (ct === 'location_changed' && (meta.oldLocation != null || meta.newLocation != null)) {
        inlineChangeContent = `${tStr('event_location_changed')} ${t('from_to', { from: (meta.oldLocation ?? '').trim(), to: (meta.newLocation ?? '').trim() })}`;
      } else if (ct === 'color_changed' && (meta.oldColor != null || meta.newColor != null)) {
        const fromColor = meta.oldColor;
        const toColor = meta.newColor;
        const swatchSx = {
          width: 10,
          height: 10,
          borderRadius: '50%',
          border: '1px solid',
          borderColor: 'divider',
          display: 'inline-block',
          verticalAlign: 'middle',
        } as const;
        inlineChangeContent = (
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Box component="span">{tStr('event_color_changed')}</Box>
            {' '}
            <Box component="span">{tStr('tooltip_from')}</Box>
            {' '}
            <Box component="span" sx={{ ...swatchSx, bgcolor: fromColor ?? 'transparent' }} />
            {' '}
            <Box component="span">{tStr('tooltip_to')}</Box>
            {' '}
            <Box component="span" sx={{ ...swatchSx, bgcolor: toColor ?? 'transparent' }} />
          </Box>
        );
      } else if (ct === 'asset_changed' && (meta.oldAssetName != null || meta.newAssetName != null)) {
        inlineChangeContent = `${tStr('event_asset_changed')} ${t('from_to', { from: (meta.oldAssetName ?? '').trim(), to: (meta.newAssetName ?? '').trim() })}`;
      }
    } else if (activity.action === 'event_reminder_added' && meta.reminderMinutes?.length) {
      const tStr = t as (k: string) => string;
      inlineChangeContent = (
        <>
          {tStr('event_reminder_added')}
          {' '}
          {meta.reminderMinutes.map((m, i) => (
            // eslint-disable-next-line react/no-array-index-key -- reminder overrides have no server id
            <Box component="span" key={i}>
              {i > 0 && '; '}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {formatReminderDuration(m, tStr)}
              </Box>
            </Box>
          ))}
        </>
      );
    }
  } else if (meta?.fileName) {
    entityName = meta.fileName;
  } else if (meta?.oldName && meta?.newName && activity.action === 'doc_renamed') {
    entityName = `${meta.oldName} → ${meta.newName}`;
  } else if (meta?.tabName) {
    entityName = tAssets(`tabs_${meta.tabName}` as any) || meta.tabName;
  } else if (meta?.folderName) {
    entityName = meta.folderName;
  }

  if (activity.action === 'doc_folder_renamed' && meta?.oldName && meta?.newName) {
    inlineChangeContent = t.rich('from_to_bold', {
      from: meta.oldName,
      to: meta.newName,
      bold: chunks => <Box component="span" sx={{ fontWeight: 600 }}>{chunks}</Box>,
    });
  } else if (activity.action === 'doc_moved' || activity.action === 'doc_folder_moved') {
    const tStr = t as (k: string) => string;
    const fromName = meta?.fromFolderName || tStr('folder_root');
    const toName = meta?.toFolderName || tStr('folder_root');
    inlineChangeContent = t.rich('from_to_bold', {
      from: fromName,
      to: toName,
      bold: chunks => <Box component="span" sx={{ fontWeight: 600 }}>{chunks}</Box>,
    });
  }

  const assetTabs = activity.assetTabs as string[] | undefined;
  const hasActivityTab = assetTabs?.includes('activity');
  const assetHref
    = showAssetLink && activity.assetType
      ? `/${locale}/assets/${pluralizeType(activity.assetType)}/${activity.assetId}?tab=${hasActivityTab ? 'activity' : 'overview'}`
      : null;

  const isTabAction = activity.action === 'tab_added' || activity.action === 'tab_moved' || activity.action === 'tab_removed';
  const tabHref
    = isTabAction && meta?.tabName && activity.assetType && activity.assetId
      ? `/${locale}/assets/${pluralizeType(activity.assetType)}/${activity.assetId}?tab=${meta.tabName}`
      : null;

  const hasFilePreview = (
    activity.action === 'doc_uploaded'
    || activity.action === 'image_uploaded'
    || activity.action === 'doc_renamed'
    || activity.action === 'doc_moved'
  ) && meta?.url;
  const filePreviewType = activity.action === 'image_uploaded' ? 'image' : 'pdf';
  const isDocAction = activity.action === 'doc_uploaded'
    || activity.action === 'doc_deleted'
    || activity.action === 'doc_renamed'
    || activity.action === 'doc_moved';
  const isFolderAction = activity.action === 'doc_folder_created'
    || activity.action === 'doc_folder_moved'
    || activity.action === 'doc_folder_renamed'
    || activity.action === 'doc_folder_deleted';
  const isDocsEntityAction = isDocAction || isFolderAction;
  const isGalleryImageChip = hasFilePreview && filePreviewType === 'image';
  const docNameForIcon = meta?.fileName ?? meta?.newName ?? meta?.oldName ?? entityName ?? '';
  const isPdfDoc = docNameForIcon.toLowerCase().endsWith('.pdf');
  const docsTabHref = null;
  const isEventClickable = (activity.action === 'event_created' || activity.action === 'event_updated' || activity.action === 'event_deleted' || activity.action === 'event_reminder_added')
    && activity.entityId
    && onEventClick;
  const isEventAction = activity.action === 'event_created' || activity.action === 'event_updated' || activity.action === 'event_deleted' || activity.action === 'event_reminder_added';

  const handleEntityClick = (e: React.MouseEvent<HTMLElement>) => {
    if (hasFilePreview && onFileClick && meta?.url) {
      e.preventDefault();
      onFileClick(
        { id: meta.fileId ?? '', name: meta.fileName ?? meta.newName ?? 'File', url: meta.url },
        filePreviewType,
      );
    } else if (isEventClickable) {
      e.preventDefault();
      onEventClick(activity.entityId!, e.currentTarget);
    }
  };

  const isEntityClickable = hasFilePreview || isEventClickable;
  const isTabClickable = Boolean(tabHref);
  const isTabDisabled = Boolean(
    isTabClickable && meta?.tabName && Array.isArray(assetTabs) && !assetTabs.includes(meta.tabName),
  );

  const tStr = t as (key: string) => string;
  const visibleAssetChanges
    = (activity.action === 'asset_updated' || activity.action === 'vehicle_data_refreshed') && meta?.changes
      ? meta.changes.filter(ch => !areAssetFieldValuesEqual(ch.before, ch.after))
      : [];
  const assetChangeCount = visibleAssetChanges.length;
  const visibleEventChanges: EventChangeRow[]
    = activity.action === 'event_updated' && Array.isArray(meta?.changes)
      ? meta.changes
          .filter((ch): ch is EventChangeRow => (
            typeof ch === 'object'
            && ch !== null
            && 'field' in ch
            && 'before' in ch
            && 'after' in ch
            && typeof (ch as { field?: unknown }).field === 'string'
          ))
          .filter(ch => !areAssetFieldValuesEqual(ch.before, ch.after))
      : [];
  const eventChangeCount = visibleEventChanges.length;
  const tAssetsFn = tAssets as (key: string) => string;

  const sections: React.ReactNode[] = [];

  // Section 1: Action + optional "by user" with bold display name
  if (actionLabel) {
    let actionSection: React.ReactNode = null;

    if (byUserLabel && userDisplayName) {
      const idx = byUserLabel.indexOf(userDisplayName);
      if (idx >= 0) {
        const prefix = byUserLabel.slice(0, idx);
        const suffix = byUserLabel.slice(idx + userDisplayName.length);
        actionSection = (
          <Typography variant="body2" sx={{ fontWeight: 400, py: 0 }}>
            {actionLabel}
            {' '}
            {prefix}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {userDisplayName}
            </Box>
            {suffix}
          </Typography>
        );
      } else {
        actionSection = (
          <Typography variant="body2" sx={{ fontWeight: 400, py: 0 }}>
            {actionLabel}
            {' '}
            {byUserLabel}
          </Typography>
        );
      }
    } else {
      actionSection = (
        <Typography variant="body2" sx={{ fontWeight: 400, py: 0 }}>
          {actionLabel}
        </Typography>
      );
    }

    sections.push(actionSection);
  }

  if (
    (activity.action === 'asset_updated' || activity.action === 'vehicle_data_refreshed')
    && assetChangeCount > 0
  ) {
    if (assetChangeCount === 1) {
      const first = visibleAssetChanges[0]!;
      sections.push(
        <Box
          key="asset-updates"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 0,
            maxWidth: '100%',
          }}
        >
          {activity.action === 'vehicle_data_refreshed' && meta?.registration
            ? (
                <Typography variant="caption" color="text.secondary" component="span" sx={{ whiteSpace: 'nowrap' }}>
                  (
                  {meta.registration}
                  )
                  {' '}
                </Typography>
              )
            : null}
          {renderAssetChangeSentence(first, tStr, tAssetsFn, 'inline')}
        </Box>,
      );
    } else {
      sections.push(
        <Box
          key="asset-updates"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
            minWidth: 0,
            maxWidth: '100%',
          }}
        >
          <Button
            component="span"
            variant="text"
            size="small"
            onClick={event => setAssetChangesAnchorEl(event.currentTarget)}
            sx={{
              flexShrink: 0,
              px: 0.5,
              py: 0,
              textTransform: 'none',
              fontWeight: 500,
              verticalAlign: 'baseline',
              typography: 'caption',
            }}
          >
            {t('updates_view_changes', { count: assetChangeCount })}
          </Button>
        </Box>,
      );
    }
  } else if (activity.action === 'vehicle_data_refreshed' && meta?.registration) {
    sections.push(
      <Typography key="vehicle-reg-only" variant="caption" color="text.secondary" component="span">
        {t('registration_label', { registration: meta.registration })}
      </Typography>,
    );
  }

  // Section 2: Entity (event/doc/tab/etc.)
  let entitySection: React.ReactNode | null = null;
  if (entityName) {
    if (isTabClickable) {
      entitySection = isTabDisabled
        ? (
            <Button
              component="button"
              variant="text"
              size="small"
              color="inherit"
              disabled
              startIcon={(() => {
                const TabIconInline = meta?.tabName ? getTabIcon(meta.tabName) : OverviewIcon;
                return <TabIconInline sx={{ fontSize: 16 }} />;
              })()}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                py: 0,
                px: 0.5,
                color: 'text.secondary',
                border: 'none',
                borderBottom: '2px solid',
                borderRadius: 0,
                borderColor: 'primary.main',
              }}
            >
              {entityName}
            </Button>
          )
        : (
            <Tooltip title={(t as (k: string) => string)('view_tab')}>
              <Button
                component={LinkNext}
                href={tabHref!}
                variant="text"
                size="small"
                color="inherit"
                startIcon={(() => {
                  const TabIconInline = meta?.tabName ? getTabIcon(meta.tabName) : OverviewIcon;
                  return <TabIconInline sx={{ fontSize: 16 }} />;
                })()}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 0,
                  px: 0.5,
                  color: 'text.secondary',
                  border: 'none',
                  borderBottom: '2px solid',
                  borderRadius: 0,
                  borderColor: 'primary.main',
                }}
              >
                {entityName}
              </Button>
            </Tooltip>
          );
    } else {
      const tStr = t as (k: string) => string;

      if (isEventAction && meta?.eventName) {
        const createdAt = new Date(activity.createdAt);
        const iso = createdAt.toISOString();
        const colorFromMeta = meta?.eventColor
          ?? (meta?.changeType === 'color_changed' ? meta.newColor ?? meta.oldColor ?? null : null);
        const calendarEvent: CalendarEventType = {
          id: activity.entityId ?? activity.id,
          assetId: activity.assetId,
          userId: activity.userId,
          name: meta.eventName,
          description: null,
          location: null,
          color: colorFromMeta ?? null,
          start: iso,
          end: iso,
          reminders: null,
          createdAt: iso,
          updatedAt: iso,
        };

        const chip = (
          <Box
            component="button"
            type="button"
            disabled={!isEventClickable}
            onClick={isEventClickable ? handleEntityClick : undefined}
            sx={{
              border: 'none',
              p: 0,
              m: 0,
              backgroundColor: 'transparent',
              cursor: isEventClickable ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <CalendarEvent
              event={calendarEvent}
              variant="compacter"
              showEndTime={false}
              showStartTime={false}
            />
          </Box>
        );

        if (isEventClickable) {
          entitySection = (
            <Tooltip title={tStr('open_event')}>
              {chip}
            </Tooltip>
          );
        } else {
          entitySection = chip;
        }
      } else {
        const entityIcon = (() => {
          if (isFolderAction) {
            return <DocsIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
          }
          if (hasFilePreview) {
            const EntityIcon = filePreviewType === 'image' ? ImageIcon : (isPdfDoc ? PdfIcon : FileIcon);
            const iconColor = filePreviewType === 'image'
              ? 'action'
              : (isPdfDoc ? 'error' : 'action');
            return <EntityIcon sx={{ fontSize: 16 }} color={iconColor} />;
          }
          if (isDocAction) {
            const EntityIcon = isPdfDoc ? PdfIcon : FileIcon;
            return <EntityIcon sx={{ fontSize: 16 }} color={isPdfDoc ? 'error' : 'action'} />;
          }
          if (isEventClickable) {
            return <EventIcon sx={{ fontSize: 16 }} />;
          }
          return <Icon sx={{ fontSize: 16 }} />;
        })();

        const button = (
          <Button
            variant={isDocsEntityAction ? 'text' : 'outlined'}
            size="small"
            color="inherit"
            component={docsTabHref ? LinkNext : 'button'}
            href={docsTabHref ?? undefined}
            disabled={isFolderAction || (!isEntityClickable && !isDocsEntityAction && !docsTabHref)}
            onClick={isEntityClickable ? handleEntityClick : undefined}
            startIcon={entityIcon}
            sx={{
              'textTransform': 'none',
              'fontWeight': 500,
              'py': isDocsEntityAction ? 0.375 : 0,
              'px': isDocsEntityAction ? 0.75 : 0.5,
              'color': isDocsEntityAction ? 'text.primary' : undefined,
              'border': isDocsEntityAction || isGalleryImageChip ? '1px solid' : undefined,
              'borderColor': (isDocsEntityAction || isGalleryImageChip) ? 'divider' : undefined,
              'borderRadius': isDocsEntityAction || isGalleryImageChip ? 1 : undefined,
              'backgroundColor': isDocsEntityAction ? 'transparent' : undefined,
              'cursor': isFolderAction ? 'default' : undefined,
              '&:hover': isDocsEntityAction
                ? {
                    bgcolor: 'transparent',
                    borderColor: 'divider',
                  }
                : isGalleryImageChip
                  ? {
                      borderColor: 'divider',
                    }
                  : undefined,
            }}
          >
            {entityName}
          </Button>
        );

        let tooltipTitle: string | null = null;
        if (hasFilePreview && filePreviewType === 'image' && isEntityClickable) {
          tooltipTitle = tStr('view_image');
        } else if (isEventClickable) {
          tooltipTitle = tStr('open_event');
        }
        entitySection = tooltipTitle
          ? <Tooltip title={tooltipTitle}>{button}</Tooltip>
          : button;
      }
    }
  }

  if (entitySection) {
    sections.push(entitySection);
  }

  if (activity.action === 'event_updated' && eventChangeCount > 0) {
    if (eventChangeCount === 1) {
      const first = visibleEventChanges[0]!;
      sections.push(
        <Box
          key="event-updates"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 0,
            maxWidth: '100%',
          }}
        >
          {renderEventChangeSentence(first, tStr, 'inline')}
        </Box>,
      );
    } else {
      sections.push(
        <Box
          key="event-updates"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
            minWidth: 0,
            maxWidth: '100%',
          }}
        >
          <Button
            component="span"
            variant="text"
            size="small"
            onClick={event => setEventChangesAnchorEl(event.currentTarget)}
            sx={{
              flexShrink: 0,
              px: 0.5,
              py: 0,
              textTransform: 'none',
              fontWeight: 500,
              verticalAlign: 'baseline',
              typography: 'caption',
            }}
          >
            {t('updates_view_changes', { count: eventChangeCount })}
          </Button>
        </Box>,
      );
    }
  }

  // Section 3: Inline change description (for event_updated details)
  let changeSection: React.ReactNode | null = null;
  if (inlineChangeContent && !(activity.action === 'event_updated' && eventChangeCount > 0)) {
    changeSection = (
      <Typography variant="caption" component="span" sx={{ fontWeight: 400, py: 0 }}>
        {inlineChangeContent}
      </Typography>
    );
  }

  if (changeSection) {
    sections.push(changeSection);
  }

  // Section 4: Relative time
  const timeSection = (
    <Typography variant="caption" color="text.secondary">
      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
    </Typography>
  );
  sections.push(timeSection);

  // Section 5: Asset link (if any)
  let assetSection: React.ReactNode | null = null;
  if (assetHref && activity.assetName) {
    assetSection = (
      <Button
        component={LinkNext}
        href={assetHref}
        variant="text"
        size="small"
        color="inherit"
        startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
        }}
      >
        {activity.assetName}
      </Button>
    );
  }

  if (assetSection) {
    sections.push(assetSection);
  }

  return (
    <TimelineItem
      sx={{
        'minHeight': 'auto',
        'alignItems': 'stretch',
        '&:before': {
          flex: 0,
          padding: 0,
        },
      }}
    >
      <TimelineSeparator sx={{ py: 0 }}>
        <TimelineDot
          variant="outlined"
          sx={{
            // Lab default is margin 11.5px 0 — throws off vertical alignment with text
            margin: 0,
            boxShadow: 'none',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: 0.35,
            alignSelf: 'center',
          }}
        >
          <Icon sx={{ fontSize: 18, display: 'block' }} />
        </TimelineDot>
        {!isLast && <TimelineConnector sx={{ bgcolor: 'divider' }} />}
      </TimelineSeparator>
      <TimelineContent
        sx={{
          flex: 1,
          minWidth: 0,
          py: 0,
          px: 0,
          pl: 1.5,
          pr: 0,
          pb: 2,
          pt: 0.25,
          m: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            flexWrap: 'wrap',
            flex: 1,
            py: 0,
          }}
        >
          {sections.map((section, index) => (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
            >
              {index > 0 && (
                <Typography variant="body2" color="text.secondary" component="span">
                  {' • '}
                </Typography>
              )}
              {section}
            </Box>
          ))}
        </Box>
        {(activity.action === 'asset_updated' || activity.action === 'vehicle_data_refreshed')
          && assetChangeCount > 1 && (
          <Popover
            open={Boolean(assetChangesAnchorEl)}
            anchorEl={assetChangesAnchorEl}
            onClose={() => setAssetChangesAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Paper sx={{ p: 2, maxWidth: 420 }}>
              {activity.action === 'vehicle_data_refreshed' && meta?.registration && (
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('registration_label', { registration: meta.registration })}
                </Typography>
              )}
              <Stack spacing={1}>
                {visibleAssetChanges.map(ch => (
                  <Box key={assetChangeRowKey(activity, ch)}>
                    {renderAssetChangeSentence(ch, tStr, tAssetsFn, 'stack')}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Popover>
        )}
        {activity.action === 'event_updated' && eventChangeCount > 1 && (
          <Popover
            open={Boolean(eventChangesAnchorEl)}
            anchorEl={eventChangesAnchorEl}
            onClose={() => setEventChangesAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Paper sx={{ p: 2, maxWidth: 420 }}>
              <Stack spacing={1}>
                {visibleEventChanges.map(ch => (
                  <Box key={eventChangeRowKey(activity, ch)}>
                    {renderEventChangeSentence(ch, tStr, 'stack')}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Popover>
        )}
      </TimelineContent>
    </TimelineItem>
  );
}
