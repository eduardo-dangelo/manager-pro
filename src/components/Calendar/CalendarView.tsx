'use client';

import type { CalendarEvent, CalendarViewMode } from './types';
import type { Asset } from '@/components/Assets/utils';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, ButtonBase, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  addDays,
  addMonths,
  addYears,
  format,
  startOfMonth,
} from 'date-fns';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { getButtonGroupSx } from '@/utils/buttonGroupStyles';
import { CreateEventModal } from './CreateEventModal';
import { CreateEventPopover } from './CreateEventPopover';
import { DayEventsPopover } from './DayEventsPopover';
import { DayPickerPopover } from './DayPickerPopover';
import { EventDetailsPopover } from './EventDetailsPopover';
import { MonthPickerPopover } from './MonthPickerPopover';
import { DayView } from './views/DayView';
import { MonthView } from './views/MonthView';
import { ScheduleView } from './views/ScheduleView';
import { YearView } from './views/YearView';
import { YearPickerPopover } from './YearPickerPopover';

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return events.filter((e) => {
    const start = format(new Date(e.start), 'yyyy-MM-dd');
    const end = format(new Date(e.end), 'yyyy-MM-dd');
    return (dateStr >= start && dateStr <= end) || start === dateStr;
  });
}

type CalendarViewProps = {
  events: CalendarEvent[];
  onDayClick?: (date: Date, anchorEl?: HTMLElement) => void;
  locale: string;
  defaultView?: CalendarViewMode;
  assetId?: number;
  assets?: Asset[];
  onEventsChange?: (events: CalendarEvent[]) => void;
};

function getHeaderText(viewMode: CalendarViewMode, currentDate: Date, t: (key: string) => string): string {
  switch (viewMode) {
    case 'day':
      return format(currentDate, 'EEEE, MMMM d, yyyy');
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
  const [currentDate, setCurrentDate] = useState(() => getTodayDate(defaultView));
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | undefined>(undefined);
  const [yearSlideDirection, setYearSlideDirection] = useState<'prev' | 'next' | null>(null);
  const [yearSlideToYear, setYearSlideToYear] = useState<number | null>(null);
  const [yearDayPopoverAnchor, setYearDayPopoverAnchor] = useState<HTMLElement | null>(null);
  const [yearDayPopoverDate, setYearDayPopoverDate] = useState<Date | null>(null);
  const [createPopoverAnchor, setCreatePopoverAnchor] = useState<HTMLElement | null>(null);
  const [createPopoverDate, setCreatePopoverDate] = useState<Date | undefined>(undefined);
  const [eventDetailsAnchor, setEventDetailsAnchor] = useState<HTMLElement | null>(null);
  const [eventDetailsEvent, setEventDetailsEvent] = useState<CalendarEvent | null>(null);
  const [headerPickerAnchor, setHeaderPickerAnchor] = useState<HTMLElement | null>(null);
  const [headerPickerType, setHeaderPickerType] = useState<'year' | 'month' | 'day' | null>(null);
  const [monthSlideDirection, setMonthSlideDirection] = useState<'prev' | 'next' | null>(null);
  const [monthSlideToDate, setMonthSlideToDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editPopoverAnchor, setEditPopoverAnchor] = useState<HTMLElement | null>(null);

  const handleEventClick = (event: CalendarEvent, anchorEl: HTMLElement) => {
    setEventDetailsAnchor(anchorEl);
    setEventDetailsEvent(event);
  };

  const handleDayClick = (date: Date, anchorEl?: HTMLElement) => {
    if (anchorEl != null) {
      setYearDayPopoverAnchor(anchorEl);
      setYearDayPopoverDate(date);
      onDayClickProp?.(date, anchorEl);
      return;
    }
    setCreateModalDate(date);
    setCreateModalOpen(true);
    onDayClickProp?.(date);
  };

  const handleCreateSuccess = (event: CalendarEvent) => {
    onEventsChange?.([...events, event]);
  };

  const handleViewChange = (_e: React.MouseEvent<HTMLElement>, value: CalendarViewMode | null) => {
    if (value == null || value === viewMode) {
      return;
    }

    setViewMode(value);
    setCurrentDate(getTodayDate(value));

    if (value !== 'year') {
      setYearDayPopoverAnchor(null);
      setYearDayPopoverDate(null);
    }
  };

  const handlePrev = () => {
    if (viewMode === 'year') {
      setYearSlideDirection('prev');
    } else if (viewMode === 'month') {
      setMonthSlideDirection('prev');
    } else {
      setCurrentDate(getPrevDate(viewMode, currentDate));
    }
  };
  const handleNext = () => {
    if (viewMode === 'year') {
      setYearSlideDirection('next');
    } else if (viewMode === 'month') {
      setMonthSlideDirection('next');
    } else {
      setCurrentDate(getNextDate(viewMode, currentDate));
    }
  };
  const handleToday = () => {
    const todayDate = getTodayDate(viewMode);
    if (viewMode === 'year') {
      const currentYear = currentDate.getFullYear();
      const todayYear = todayDate.getFullYear();
      if (currentYear !== todayYear) {
        setYearSlideToYear(todayYear);
      } else {
        setCurrentDate(todayDate);
      }
    } else {
      setCurrentDate(todayDate);
    }
  };

  const tHeader = t as (key: string) => string;
  const headerText = getHeaderText(viewMode, currentDate, tHeader);

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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-start',
          }}
        >
          {(viewMode === 'year' || viewMode === 'month' || viewMode === 'day')
            ? viewMode === 'year'
              ? (
                  <ButtonBase
                    component="button"
                    type="button"
                    onClick={(e) => {
                      setHeaderPickerAnchor(e.currentTarget);
                      setHeaderPickerType('year');
                    }}
                    aria-haspopup="dialog"
                    aria-expanded={headerPickerAnchor != null && headerPickerType === 'year'}
                    aria-label={tHeader('select_year')}
                    sx={{
                      'borderRadius': 1,
                      'textAlign': 'left',
                      'px': 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {headerText}
                    </Typography>
                  </ButtonBase>
                )
              : viewMode === 'month'
                ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
                      <ButtonBase
                        component="button"
                        type="button"
                        onClick={(e) => {
                          setHeaderPickerAnchor(e.currentTarget);
                          setHeaderPickerType('month');
                        }}
                        aria-haspopup="dialog"
                        aria-expanded={headerPickerAnchor != null && headerPickerType === 'month'}
                        aria-label={tHeader('select_month')}
                        sx={{
                          'borderRadius': 1,
                          'textAlign': 'left',
                          '&:hover': { bgcolor: 'action.hover' },
                          'px': 0.5,
                          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
                          {format(currentDate, 'MMMM')}
                        </Typography>
                      </ButtonBase>
                      <ButtonBase
                        component="button"
                        type="button"
                        onClick={(e) => {
                          setHeaderPickerAnchor(e.currentTarget);
                          setHeaderPickerType('year');
                        }}
                        aria-haspopup="dialog"
                        aria-expanded={headerPickerAnchor != null && headerPickerType === 'year'}
                        aria-label={tHeader('select_year')}
                        sx={{
                          'borderRadius': 1,
                          'textAlign': 'left',
                          'px': 0.5,
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
                          {format(currentDate, 'yyyy')}
                        </Typography>
                      </ButtonBase>
                    </Box>
                  )
                : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
                      <ButtonBase
                        component="button"
                        type="button"
                        onClick={(e) => {
                          setHeaderPickerAnchor(e.currentTarget);
                          setHeaderPickerType('day');
                        }}
                        aria-haspopup="dialog"
                        aria-expanded={headerPickerAnchor != null && headerPickerType === 'day'}
                        aria-label={tHeader('select_date')}
                        sx={{
                          'borderRadius': 1,
                          'textAlign': 'left',
                          '&:hover': { bgcolor: 'action.hover' },
                          'px': 0.5,
                          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
                          {format(currentDate, 'd')}
                        </Typography>
                      </ButtonBase>
                      <ButtonBase
                        component="button"
                        type="button"
                        onClick={(e) => {
                          setHeaderPickerAnchor(e.currentTarget);
                          setHeaderPickerType('month');
                        }}
                        aria-haspopup="dialog"
                        aria-expanded={headerPickerAnchor != null && headerPickerType === 'month'}
                        aria-label={tHeader('select_month')}
                        sx={{
                          'borderRadius': 1,
                          'textAlign': 'left',
                          '&:hover': { bgcolor: 'action.hover' },
                          'px': 0.5,
                          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
                          {format(currentDate, 'MMMM')}
                        </Typography>
                      </ButtonBase>
                      <ButtonBase
                        component="button"
                        type="button"
                        onClick={(e) => {
                          setHeaderPickerAnchor(e.currentTarget);
                          setHeaderPickerType('year');
                        }}
                        aria-haspopup="dialog"
                        aria-expanded={headerPickerAnchor != null && headerPickerType === 'year'}
                        aria-label={tHeader('select_year')}
                        sx={{
                          'borderRadius': 1,
                          'textAlign': 'left',
                          '&:hover': { bgcolor: 'action.hover' },
                          'px': 0.5,
                          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
                          {format(currentDate, 'yyyy')}
                        </Typography>
                      </ButtonBase>
                    </Box>
                  )
            : (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {headerText}
                </Typography>
              )}
        </Box>
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
          onEventClick={handleEventClick}
          locale={locale}
          slideDirection={monthSlideDirection}
          onSlideDirectionComplete={() => setMonthSlideDirection(null)}
          slideToDate={monthSlideToDate}
          onSlideToMonthComplete={() => setMonthSlideToDate(null)}
        />
      )}
      {viewMode === 'day' && (
        <DayView
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          events={events}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
          locale={locale}
        />
      )}
      {viewMode === 'year' && (
        <YearView
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          events={events}
          onDayClick={handleDayClick}
          onMonthClick={(date) => {
            setYearDayPopoverAnchor(null);
            setYearDayPopoverDate(null);
            setCurrentDate(date);
            setViewMode('month');
          }}
          locale={locale}
          slideDirection={yearSlideDirection}
          onSlideDirectionComplete={() => setYearSlideDirection(null)}
          slideToYear={yearSlideToYear}
          onSlideToYearComplete={() => setYearSlideToYear(null)}
        />
      )}
      {viewMode === 'schedule' && (
        <ScheduleView
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          events={events}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
          locale={locale}
        />
      )}

      {yearDayPopoverAnchor != null && yearDayPopoverDate != null && (
        <DayEventsPopover
          open
          anchorEl={yearDayPopoverAnchor}
          date={yearDayPopoverDate}
          events={getEventsForDate(events, yearDayPopoverDate)}
          onClose={() => {
            setYearDayPopoverAnchor(null);
            setYearDayPopoverDate(null);
          }}
          onCreateEvent={(date) => {
            setCreatePopoverAnchor(yearDayPopoverAnchor);
            setCreatePopoverDate(date);
            setYearDayPopoverAnchor(null);
            setYearDayPopoverDate(null);
          }}
          onDayTitleClick={(date) => {
            setYearDayPopoverAnchor(null);
            setYearDayPopoverDate(null);
            setCurrentDate(date);
            setViewMode('day');
          }}
          onEventClick={(ev) => {
            const dayAnchor = yearDayPopoverAnchor;
            setYearDayPopoverAnchor(null);
            setYearDayPopoverDate(null);
            handleEventClick(ev, dayAnchor);
          }}
          locale={locale}
        />
      )}

      {createPopoverAnchor != null && (
        <CreateEventPopover
          open
          anchorEl={createPopoverAnchor}
          onClose={() => {
            setCreatePopoverAnchor(null);
            setCreatePopoverDate(undefined);
          }}
          initialDate={createPopoverDate}
          assetId={assetId}
          assets={assets}
          locale={locale}
          onCreateSuccess={(event) => {
            handleCreateSuccess(event);
            setCreatePopoverAnchor(null);
            setCreatePopoverDate(undefined);
          }}
        />
      )}

      {eventDetailsAnchor != null && eventDetailsEvent != null && (
        <EventDetailsPopover
          open
          anchorEl={eventDetailsAnchor}
          event={eventDetailsEvent}
          assets={assets}
          showAssetCard={!assetId}
          onClose={() => {
            setEventDetailsAnchor(null);
            setEventDetailsEvent(null);
          }}
          onEdit={() => {
            if (!eventDetailsEvent || !eventDetailsAnchor) {
              return;
            }
            setEditingEvent(eventDetailsEvent);
            setEditPopoverAnchor(eventDetailsAnchor);
            setEventDetailsAnchor(null);
            setEventDetailsEvent(null);
          }}
          locale={locale}
        />
      )}

      {headerPickerAnchor != null && headerPickerType === 'year' && (
        <YearPickerPopover
          open
          anchorEl={headerPickerAnchor}
          onClose={() => {
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          currentYear={currentDate.getFullYear()}
          onSelect={(year) => {
            if (viewMode === 'year') {
              setYearSlideToYear(year);
            } else if (viewMode === 'month') {
              setCurrentDate(new Date(year, currentDate.getMonth(), 1));
            } else {
              setCurrentDate(new Date(year, currentDate.getMonth(), currentDate.getDate()));
            }
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          locale={locale}
        />
      )}

      {headerPickerAnchor != null && headerPickerType === 'month' && (
        <MonthPickerPopover
          open
          anchorEl={headerPickerAnchor}
          onClose={() => {
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          currentDate={currentDate}
          onSelect={(monthIndex) => {
            const year = currentDate.getFullYear();
            if (viewMode === 'month') {
              setMonthSlideToDate(new Date(year, monthIndex, 1));
            } else {
              const day = viewMode === 'day' ? Math.min(currentDate.getDate(), new Date(year, monthIndex + 1, 0).getDate()) : 1;
              setCurrentDate(new Date(year, monthIndex, day));
            }
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          locale={locale}
        />
      )}

      {headerPickerAnchor != null && headerPickerType === 'day' && (
        <DayPickerPopover
          open
          anchorEl={headerPickerAnchor}
          onClose={() => {
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
          currentDate={currentDate}
          onSelect={(date) => {
            setCurrentDate(date);
            setHeaderPickerAnchor(null);
            setHeaderPickerType(null);
          }}
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
      {editPopoverAnchor != null && editingEvent != null && (
        <CreateEventPopover
          open
          anchorEl={editPopoverAnchor}
          onClose={() => {
            setEditPopoverAnchor(null);
            setEditingEvent(null);
          }}
          initialDate={new Date(editingEvent.start)}
          assetId={assetId}
          assets={assets}
          locale={locale}
          mode="edit"
          event={editingEvent}
          onSuccess={(updated) => {
            if (!onEventsChange) {
              setEditPopoverAnchor(null);
              setEditingEvent(null);
              return;
            }

            let nextEvents: CalendarEvent[];

            if (assetId != null) {
              if (updated.assetId === assetId) {
                nextEvents = events.map(ev => (ev.id === updated.id ? updated : ev));
              } else {
                nextEvents = events.filter(ev => ev.id !== updated.id);
              }
            } else {
              nextEvents = events.map(ev => (ev.id === updated.id ? updated : ev));
            }

            onEventsChange(nextEvents);
            setEditPopoverAnchor(null);
            setEditingEvent(null);
          }}
        />
      )}
    </Box>
  );
}
