'use client';

import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { Box, Chip, Paper, Typography } from '@mui/material';
import moment from 'moment';
import { useTranslations } from 'next-intl';

type Objective = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
};

type Sprint = {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  objectives: Objective[];
  sprints: Sprint[];
};

type TimelineTabProps = {
  project: Project;
};

type TimelineItem = {
  id: number;
  type: 'objective' | 'sprint';
  name: string;
  status: string;
  priority?: string;
  startDate: Date | null;
  endDate: Date | null;
};

export function TimelineTab({ project }: TimelineTabProps) {
  const t = useTranslations('Projects');

  // Combine objectives and sprints into timeline items
  const timelineItems: TimelineItem[] = [
    ...project.objectives
      .filter(obj => obj.startDate || obj.dueDate)
      .map(obj => ({
        id: obj.id,
        type: 'objective' as const,
        name: obj.name,
        status: obj.status,
        priority: obj.priority,
        startDate: obj.startDate || null,
        endDate: obj.dueDate || null,
      })),
    ...project.sprints
      .filter(sprint => sprint.startDate || sprint.endDate)
      .map(sprint => ({
        id: sprint.id,
        type: 'sprint' as const,
        name: sprint.name,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      })),
  ].sort((a, b) => {
    const dateA = a.startDate || a.endDate;
    const dateB = b.startDate || b.endDate;
    if (!dateA) {
      return 1;
    }
    if (!dateB) {
      return -1;
    }
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'error.100', color: 'error.700', border: 'error.main' };
      case 'medium':
        return { bg: 'warning.100', color: 'warning.700', border: 'warning.main' };
      case 'low':
        return { bg: 'success.100', color: 'success.700', border: 'success.main' };
      default:
        return { bg: 'grey.100', color: 'grey.700', border: 'grey.400' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success.main';
      case 'active':
      case 'in-progress':
        return 'primary.main';
      case 'planned':
        return 'grey.500';
      default:
        return 'grey.400';
    }
  };

  const calculateProgress = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now < start) {
      return 0;
    }
    if (now > end) {
      return 100;
    }

    return Math.round(((now - start) / (end - start)) * 100);
  };

  const isOverdue = (endDate: Date | null, status: string) => {
    if (!endDate || status === 'completed') {
      return false;
    }
    return new Date(endDate) < new Date();
  };

  if (timelineItems.length === 0) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', mb: 3 }}>
          {t('tabs_timeline')}
        </Typography>
        <Paper
          sx={{
            p: 5,
            textAlign: 'center',
          }}
          elevation={0}
        >
          <Typography
            variant="body1"
            sx={{ color: 'grey.400', fontSize: '0.938rem' }}
          >
            No timeline data available. Add dates to objectives and sprints to see them here.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', mb: 3 }}>
        {t('tabs_timeline')}
      </Typography>

      <Box sx={{ position: 'relative', pl: 4 }}>
        {/* Timeline line */}
        <Box
          sx={{
            position: 'absolute',
            left: 15,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: 'grey.200',
          }}
        />

        {/* Timeline items */}
        {timelineItems.map((item, index) => {
          const priorityColors = item.type === 'objective' ? getPriorityColor(item.priority) : getPriorityColor();
          const progress = calculateProgress(item.startDate, item.endDate);
          const overdue = isOverdue(item.endDate, item.status);

          return (
            <Box
              key={`${item.type}-${item.id}`}
              sx={{ position: 'relative', mb: 3 }}
            >
              {/* Timeline dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: -27,
                  top: 8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '2px solid',
                  borderColor: getStatusColor(item.status),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                {item.status === 'completed'
                  ? (
                      <CheckCircleIcon
                        sx={{ fontSize: '1rem', color: getStatusColor(item.status) }}
                      />
                    )
                  : (
                      <RadioButtonUncheckedIcon
                        sx={{ fontSize: '1rem', color: getStatusColor(item.status) }}
                      />
                    )}
              </Box>

              <Paper
                sx={{
                  p: 2,
                  borderLeft: '4px solid',
                  borderLeftColor: item.type === 'objective' ? priorityColors.border : 'primary.main',
                  backgroundColor: overdue ? 'error.50' : 'grey.50',
                }}
                elevation={1}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: overdue ? 'error.dark' : 'grey.900',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Chip
                        label={item.type === 'objective' ? 'Objective' : 'Sprint'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.688rem',
                          backgroundColor: item.type === 'objective' ? 'primary.100' : 'secondary.100',
                          color: item.type === 'objective' ? 'primary.700' : 'secondary.700',
                        }}
                      />
                      {item.type === 'objective' && item.priority && (
                        <Chip
                          label={item.priority}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.688rem',
                            backgroundColor: priorityColors.bg,
                            color: priorityColors.color,
                            textTransform: 'capitalize',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'grey.600' }}>
                      {item.startDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: '0.875rem' }} />
                          <Typography variant="caption" sx={{ fontSize: '0.813rem' }}>
                            {moment(item.startDate).format('MMM D, YYYY')}
                          </Typography>
                        </Box>
                      )}
                      {item.startDate && item.endDate && (
                        <Typography variant="caption" sx={{ fontSize: '0.813rem' }}>
                          →
                        </Typography>
                      )}
                      {item.endDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: '0.875rem' }} />
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.813rem',
                              color: overdue ? 'error.main' : 'grey.600',
                              fontWeight: overdue ? 600 : 400,
                            }}
                          >
                            {moment(item.endDate).format('MMM D, YYYY')}
                            {overdue && ' (Overdue)'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      backgroundColor: 'white',
                      textTransform: 'capitalize',
                      fontWeight: 500,
                    }}
                  />
                </Box>

                {/* Progress bar */}
                {item.startDate && item.endDate && item.status !== 'completed' && (
                  <Box sx={{ mt: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'grey.600' }}>
                        Progress
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: overdue ? 'error.main' : 'grey.700',
                          fontWeight: 600,
                        }}
                      >
                        {progress}
                        %
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 6,
                        backgroundColor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${progress}%`,
                          height: '100%',
                          backgroundColor: overdue ? 'error.main' : 'primary.main',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
