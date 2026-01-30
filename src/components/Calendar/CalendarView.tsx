'use client';

import type { CalendarEvent, CalendarViewMode } from './types';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { getButtonGroupSx } from '@/utils/buttonGroupStyles';
import { CreateEventModal } from './CreateEventModal';
import { DayView } from './views/DayView';
import { MonthView } from './views/MonthView';
import { ScheduleView } from './views/ScheduleView';
import { WeekView } from './views/WeekView';
import { YearView } from './views/YearView';

type CalendarViewProps = {
  events: CalendarEvent[];
  onDayClick?: (date: Date) => void;
  locale: string;
  defaultView?: CalendarViewMode;
  assetId?: number;
  assets?: { id: number; name: string | null }[];
  onEventsChange?: (events: CalendarEvent[]) => void;
};

function getHeaderText(viewMode: CalendarViewMode, currentDate: Date, t: (key: string) => string): string {
  switch (viewMode) {
    case 'day':
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    case 'week': {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    case 'month':
      return format(currentDate, 'MMMM yyyy');
    case 'year':
      return format(currentDate, 'yyyy');
    case 'schedule':
      return t('view_schedule');
    default:
      return format(currentDate, 'PPP');
  }
}

function getPrevDate(viewMode: CalendarViewMode, currentDate: Date): Date {
  switch (viewMode) {
    case 'day':
      return addDays(currentDate, -1);
    case 'week':
      return addWeeks(currentDate, -1);
    case 'month':
      return addMonths(currentDate, -1);
    case 'year':
      return addYears(currentDate, -1);
    case 'schedule':
      return addDays(currentDate, -1);
    default:
      return currentDate;
  }
}

function getNextDate(viewMode: CalendarViewMode, currentDate: Date): Date {
  switch (viewMode) {
    case 'day':
      return addDays(currentDate, 1);
    case 'week':
      return addWeeks(currentDate, 1);
    case 'month':
      return addMonths(currentDate, 1);
    case 'year':
      return addYears(currentDate, 1);
    case 'schedule':
      return addDays(currentDate, 1);
    default:
      return currentDate;
  }
}

function getTodayDate(viewMode: CalendarViewMode): Date {
  const now = new Date();
  switch (viewMode) {
    case 'day':
      return now;
    case 'week':
      return startOfWeek(now, { weekStartsOn: 0 });
    case 'month':
      return startOfMonth(now);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    case 'schedule':
      return now;
    default:
      return now;
  }
}

export function CalendarView({
  events,
  onDayClick: onDayClickProp,
  locale,
  defaultView = 'month',
  assetId,
  assets,
  onEventsChange,
}: CalendarViewProps) {
  const t = useTranslations('Calendar');
  const theme = useTheme();
  const buttonGroupSx = getButtonGroupSx(theme);

  const [viewMode, setViewMode] = useState<CalendarViewMode>(defaultView);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | undefined>(undefined);

  const handleDayClick = (date: Date) => {
    setCreateModalDate(date);
    setCreateModalOpen(true);
    onDayClickProp?.(date);
  };

  const handleCreateSuccess = (event: CalendarEvent) => {
    onEventsChange?.([...events, event]);
  };

  const handleViewChange = (_e: React.MouseEvent<HTMLElement>, value: CalendarViewMode | null) => {
    if (value !== null) {
      setViewMode(value);
    }
  };

  const handlePrev = () => setCurrentDate(getPrevDate(viewMode, currentDate));
  const handleNext = () => setCurrentDate(getNextDate(viewMode, currentDate));
  const handleToday = () => setCurrentDate(getTodayDate(viewMode));

  const headerText = getHeaderText(viewMode, currentDate, t);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1.25rem',
            flex: 1,

            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 100,
          }}
        >
          {headerText}
        </Typography>
        <Box sx={{ justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            size="small"
            sx={buttonGroupSx}
          >
            <ToggleButton value="day" aria-label={t('view_day')}>
              <Typography variant="caption">
                {t('view_day')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="week" aria-label={t('view_week')}>
              <Typography variant="caption">
                {t('view_week')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="month" aria-label={t('view_month')}>
              <Typography variant="caption">
                {t('view_month')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="year" aria-label={t('view_year')}>
              <Typography variant="caption">
                {t('view_year')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="schedule" aria-label={t('view_schedule')}>
              <Typography variant="caption">
                {t('view_schedule')}
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            sx={buttonGroupSx}
            onChange={(_, value) => {
              if (value === 'prev') {
                handlePrev();
              } else if (value === 'today') {
                handleToday();
              } else if (value === 'next') {
                handleNext();
              }
            }}
          >
            <ToggleButton value="prev" aria-label="previous">
              <ChevronLeft fontSize="small" />
            </ToggleButton>
            <ToggleButton value="today" aria-label={t('today')}>
              <Typography variant="caption">
                {t('today')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="next" aria-label="next">
              <ChevronRight fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {viewMode === 'month' && (
        <MonthView
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          events={events}
          onDayClick={handleDayClick}
          locale={locale}
        />
      )}
      {viewMode === 'day' && (
        <DayView
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          events={events}
          onDayClick={handleDayClick}
          locale={locale}
        />
      )}
      {viewMode === 'week' && (
        <WeekView
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          events={events}
          onDayClick={handleDayClick}
          locale={locale}
        />
      )}
      {viewMode === 'year' && (
        <YearView
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          events={events}
          onDayClick={handleDayClick}
          locale={locale}
        />
      )}
      {viewMode === 'schedule' && (
        <ScheduleView
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          events={events}
          onDayClick={handleDayClick}
          locale={locale}
        />
      )}

      <CreateEventModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialDate={createModalDate}
        assetId={assetId}
        assets={assets}
        locale={locale}
        onCreateSuccess={handleCreateSuccess}
      />
    </Box>
  );
}
