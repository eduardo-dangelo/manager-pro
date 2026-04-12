'use client';

import type { Activity } from './types';
import type { CalendarEvent as CalendarEventType } from '@/components/Calendar/types';
import {
  History as ActivityIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Description as DocIcon,
  Folder as DocsIcon,
  Edit as EditIcon,
  CalendarMonth as EventIcon,
  Timeline as FinanceIcon,
  PhotoLibrary as GalleryIcon,
  Image as ImageIcon,
  Assessment as InsightsIcon,
  ListAlt as ListingIcon,
  OpenInNew as OpenInNewIcon,
  Dashboard as OverviewIcon,
  DirectionsRun as SprintsIcon,
  CheckBox as TodosIcon,
} from '@mui/icons-material';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import LinkNext from 'next/link';
import { CalendarEvent } from '@/components/Calendar/CalendarEvent';

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
    project: 'projects',
    trip: 'trips',
    custom: 'customs',
  };
  return pluralMap[type] || `${type}s`;
};

function getTabIcon(tabName: string) {
  switch (tabName) {
    case 'overview':
      return OverviewIcon;
    case 'todos':
      return TodosIcon;
    case 'calendar':
      return CalendarIcon;
    case 'sprints':
      return SprintsIcon;
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
    case 'insights':
      return InsightsIcon;
    default:
      return OverviewIcon;
  }
}

function getActionIcon(action: Activity['action'], _tabName?: string) {
  // if (tabName && (action === 'tab_added' || action === 'tab_moved' || action === 'tab_removed')) {
  //   return getTabIcon(tabName);
  // }
  switch (action) {
    case 'asset_created':
      return AddIcon;
    case 'asset_updated':
      return EditIcon;
    case 'event_created':
    case 'event_updated':
    case 'event_deleted':
    case 'event_reminder_added':
      return EventIcon;
    case 'doc_uploaded':
    case 'doc_deleted':
    case 'doc_renamed':
    case 'doc_folder_renamed':
    case 'doc_folder_deleted':
      return DocIcon;
    case 'image_uploaded':
    case 'image_deleted':
      return ImageIcon;
    case 'tab_added':
    case 'tab_moved':
    case 'tab_removed':
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
  const Icon = getActionIcon(activity.action, (activity.metadata as { tabName?: string })?.tabName);

  const userDisplayName = [activity.userFirstName, activity.userLastName].filter(Boolean).join(' ');
  const actionLabel = t(activity.action);
  const byUserLabel = userDisplayName ? t('by_user', { userName: userDisplayName }) : null; // Line 1: "by John Doe" or just "by John Doe"

  const meta = activity.metadata as {
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
    reminderMinutes?: number[];
  } | undefined;

  // Entity name (event name, file name, etc.) - for event_updated with changeType, entity is just the event name
  let entityName: string | null = null;
  let inlineChangeContent: React.ReactNode | null = null;

  if (meta?.eventName) {
    entityName = meta.eventName;
    if (activity.action === 'event_updated' && meta.changeType) {
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
  } else if (meta?.oldName && meta?.newName && (activity.action === 'doc_renamed' || activity.action === 'doc_folder_renamed')) {
    entityName = `${meta.oldName} → ${meta.newName}`;
  } else if (meta?.tabName) {
    entityName = tAssets(`tabs_${meta.tabName}` as any) || meta.tabName;
  } else if (meta?.folderName) {
    entityName = meta.folderName;
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

  const hasFilePreview = (activity.action === 'doc_uploaded' || activity.action === 'image_uploaded' || activity.action === 'doc_renamed')
    && meta?.url;
  const filePreviewType = activity.action === 'image_uploaded' ? 'image' : 'pdf';
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
        const button = (
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            disabled={!isEntityClickable}
            onClick={isEntityClickable ? handleEntityClick : undefined}
            startIcon={(() => {
              if (hasFilePreview) {
                const EntityIcon = filePreviewType === 'image' ? ImageIcon : DocIcon;
                return <EntityIcon sx={{ fontSize: 16 }} />;
              }
              if (isEventClickable) {
                return <EventIcon sx={{ fontSize: 16 }} />;
              }
              return <Icon sx={{ fontSize: 16 }} />;
            })()}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              py: 0,
              px: 0.5,
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

  // Section 3: Inline change description (for event_updated details)
  let changeSection: React.ReactNode | null = null;
  if (inlineChangeContent) {
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
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        gap: 1,
        pb: 0.5,
        // border: '1px solid',
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
            color: 'text.secondary',
            zIndex: 1,
            // border: '1px solid',
            // borderColor: iconColor,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            p: 0.2,
            // width: 38,
            // height: 38,
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          flex: 1,
          py: 0,
          // border: '1px solid red',
          mt: -0.6,
          pb: 1.5,
          // height: '40px',
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
    </Box>
  );
}
