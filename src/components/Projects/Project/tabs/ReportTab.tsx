'use client';

import { Download as DownloadIcon } from '@mui/icons-material';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

type ReportTabProps = {
  project: Project;
};

const COLORS = {
  todo: '#94a3b8',
  'in-progress': '#3b82f6',
  done: '#22c55e',
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626',
};

export function ReportTab({ project }: ReportTabProps) {
  const t = useTranslations('Projects');

  // Calculate objectives completion
  const objectivesCompleted = project.objectives.filter(obj => obj.status === 'completed').length;
  const objectivesTotal = project.objectives.length;
  const objectivesCompletionRate = objectivesTotal > 0
    ? Math.round((objectivesCompleted / objectivesTotal) * 100)
    : 0;

  // Calculate tasks by status
  const tasksByStatus = [
    {
      name: t('kanban_todo'),
      value: project.tasks.filter(task => task.status === 'todo').length,
      color: COLORS.todo,
    },
    {
      name: t('kanban_in_progress'),
      value: project.tasks.filter(task => task.status === 'in-progress').length,
      color: COLORS['in-progress'],
    },
    {
      name: t('kanban_done'),
      value: project.tasks.filter(task => task.status === 'done').length,
      color: COLORS.done,
    },
  ].filter(item => item.value > 0);

  // Calculate tasks by priority
  const tasksByPriority = [
    {
      name: 'Low',
      value: project.tasks.filter(task => task.priority === 'low').length,
      fill: COLORS.low,
    },
    {
      name: 'Medium',
      value: project.tasks.filter(task => task.priority === 'medium').length,
      fill: COLORS.medium,
    },
    {
      name: 'High',
      value: project.tasks.filter(task => task.priority === 'high').length,
      fill: COLORS.high,
    },
    {
      name: 'Urgent',
      value: project.tasks.filter(task => task.priority === 'urgent').length,
      fill: COLORS.urgent,
    },
  ].filter(item => item.value > 0);

  const handleExport = () => {
    // Placeholder for future PDF export functionality
    // eslint-disable-next-line no-alert
    alert('Export functionality coming soon!');
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
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, fontSize: '1.25rem' }}
        >
          {t('tabs_report')}
        </Typography>
        <Button
          size="small"
          startIcon={<DownloadIcon fontSize="small" />}
          onClick={handleExport}
          variant="outlined"
          sx={{
            'textTransform': 'none',
            'fontSize': '0.813rem',
            '&:hover': { backgroundColor: 'grey.50' },
          }}
        >
          {t('export_pdf')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Objectives Completion Card */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            elevation={2}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: 'grey.600', fontSize: '0.875rem', mb: 2 }}
            >
              {t('report_objectives_completed')}
            </Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}
            >
              {objectivesCompletionRate}
              %
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'grey.500', fontSize: '0.813rem' }}
            >
              {objectivesCompleted}
              {' '}
              of
              {' '}
              {objectivesTotal}
              {' '}
              completed
            </Typography>
          </Paper>
        </Grid>

        {/* Tasks Completion Card */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            elevation={2}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: 'grey.600', fontSize: '0.875rem', mb: 2 }}
            >
              {t('report_completion_rate')}
            </Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}
            >
              {project.tasks.length > 0
                ? Math.round(
                  (project.tasks.filter(t => t.status === 'done').length / project.tasks.length)
                    * 100,
                )
                : 0}
              %
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'grey.500', fontSize: '0.813rem' }}
            >
              {project.tasks.filter(t => t.status === 'done').length}
              {' '}
              of
              {' '}
              {project.tasks.length}
              {' '}
              tasks done
            </Typography>
          </Paper>
        </Grid>

        {/* Total Tasks Card */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            elevation={2}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: 'grey.600', fontSize: '0.875rem', mb: 2 }}
            >
              Total Tasks
            </Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, color: 'grey.700', mb: 1 }}
            >
              {project.tasks.length}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'grey.500', fontSize: '0.813rem' }}
            >
              {project.objectives.length}
              {' '}
              objectives
            </Typography>
          </Paper>
        </Grid>

        {/* Tasks by Status Chart */}
        {tasksByStatus.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}
              >
                {t('report_tasks_by_status')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Tasks by Priority Chart */}
        {tasksByPriority.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}
              >
                {t('report_tasks_by_priority')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksByPriority}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Tasks" radius={[8, 8, 0, 0]}>
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Empty State */}
        {tasksByStatus.length === 0 && tasksByPriority.length === 0 && (
          <Grid item xs={12}>
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
                No data available yet. Add objectives and tasks to see insights.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

