'use client';

import type { CalendarEvent, CalendarViewMode } from './types';
import { Add as AddIcon, ViewDay as DayIcon, CalendarViewMonth as MonthIcon, Event as ScheduleIcon, ViewWeek as WeekIcon, ViewModule as YearIcon } from '@mui/icons-material';
import { Box, Button, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

  const openCreateModal = (date?: Date) => {
    setCreateModalDate(date ?? currentDate);
    setCreateModalOpen(true);
  };

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
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={buttonGroupSx}
        >
          <Tooltip title={t('view_day')}>
            <ToggleButton value="day" aria-label={t('view_day')}>
              <DayIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('view_week')}>
            <ToggleButton value="week" aria-label={t('view_week')}>
              <WeekIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('view_month')}>
            <ToggleButton value="month" aria-label={t('view_month')}>
              <MonthIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('view_year')}>
            <ToggleButton value="year" aria-label={t('view_year')}>
              <YearIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('view_schedule')}>
            <ToggleButton value="schedule" aria-label={t('view_schedule')}>
              <ScheduleIcon sx={{ fontSize: 18 }} />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => openCreateModal()}
        >
          {t('create_event')}
        </Button>
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
