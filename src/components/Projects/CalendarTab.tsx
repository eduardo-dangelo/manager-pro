'use client';

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Chip, IconButton, Paper, Typography } from '@mui/material';
import { useState } from 'react';

type Task = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  objectiveId: number | null;
};

type Objective = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
};

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  objectives: Objective[];
  tasks: Task[];
};

type CalendarTabProps = {
  project: Project;
};

export function CalendarTab({ project }: CalendarTabProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getObjectivesForDate = (day: number) => {
    const date = new Date(year, month, day);
    const dateStr = date.toDateString();

    return project.objectives.filter((objective) => {
      if (objective.dueDate) {
        const dueDate = new Date(objective.dueDate);
        return dueDate.toDateString() === dateStr;
      }
      return false;
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'success.main';
      default:
        return 'grey.500';
    }
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) {
      return false;
    }
    return (
      day === today.getDate()
      && month === today.getMonth()
      && year === today.getFullYear()
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {monthNames[month]}
          {' '}
          {year}
        </Typography>
        <Box>
          <IconButton onClick={previousMonth} size="small">
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={nextMonth} size="small">
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }} elevation={1}>
        {/* Day headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            mb: 1,
          }}
        >
          {dayNames.map(day => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'grey.700',
                pb: 1,
              }}
            >
              {day}
            </Box>
          ))}
        </Box>

        {/* Calendar grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
          }}
        >
          {calendarDays.map((day, index) => {
            const objectives = day ? getObjectivesForDate(day) : [];
            const cellKey = day ? `day-${year}-${month}-${day}` : `empty-${index}`;
            return (
              <Paper
                key={cellKey}
                sx={{
                  'minHeight': 100,
                  'p': 1,
                  'backgroundColor': day
                    ? isToday(day)
                      ? 'primary.50'
                      : 'grey.50'
                    : 'transparent',
                  'border': '1px solid',
                  'borderColor': isToday(day) ? 'primary.main' : 'grey.200',
                  'display': 'flex',
                  'flexDirection': 'column',
                  '&:hover': day
                    ? {
                        backgroundColor: isToday(day) ? 'primary.100' : 'grey.100',
                      }
                    : {},
                }}
                elevation={0}
              >
                {day && (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday(day) ? 700 : 500,
                        fontSize: '0.875rem',
                        color: isToday(day) ? 'primary.main' : 'grey.700',
                        mb: 0.5,
                      }}
                    >
                      {day}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {objectives.map(objective => (
                        <Chip
                          key={objective.id}
                          label={objective.name}
                          size="small"
                          sx={{
                            'height': 'auto',
                            'py': 0.5,
                            'fontSize': '0.688rem',
                            'backgroundColor': 'white',
                            'borderLeft': '3px solid',
                            'borderLeftColor': getPriorityColor(objective.priority),
                            'borderRadius': 1,
                            'justifyContent': 'flex-start',
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              padding: '2px 4px',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Paper>
            );
          })}
        </Box>
      </Paper>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', gap: 3, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: 'success.main',
              borderRadius: 0.5,
            }}
          />
          <Typography variant="caption" sx={{ fontSize: '0.813rem' }}>
            Low Priority
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: 'warning.main',
              borderRadius: 0.5,
            }}
          />
          <Typography variant="caption" sx={{ fontSize: '0.813rem' }}>
            Medium Priority
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: 'error.main',
              borderRadius: 0.5,
            }}
          />
          <Typography variant="caption" sx={{ fontSize: '0.813rem' }}>
            High Priority
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
