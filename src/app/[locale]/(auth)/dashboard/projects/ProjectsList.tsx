'use client';

import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectsListProps = {
  projects: Project[];
  locale: string;
};

const colorMap: Record<string, string> = {
  gray: '#6b7280',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
};

const statusColorMap: Record<string, 'default' | 'success' | 'info' | 'warning'> = {
  'active': 'success',
  'completed': 'info',
  'archived': 'default',
  'on-hold': 'warning',
};

export function ProjectsList({ projects, locale }: ProjectsListProps) {
  return (
    <Grid container spacing={3}>
      {projects.map(project => (
        <Grid item xs={12} sm={6} md={4} key={project.id}>
          <Card
            component={Link}
            href={`/${locale}/dashboard/projects/${project.id}`}
            sx={{
              'border': 1,
              'borderColor': 'grey.200',
              'borderRadius': 2,
              'textDecoration': 'none',
              'transition': 'all 0.2s',
              'cursor': 'pointer',
              'height': '100%',
              'display': 'flex',
              'flexDirection': 'column',
              '&:hover': {
                borderColor: 'grey.400',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              {/* Color indicator */}
              <Box
                sx={{
                  width: 40,
                  height: 4,
                  bgcolor: colorMap[project.color] || colorMap.gray,
                  borderRadius: 1,
                  mb: 2,
                }}
              />

              {/* Project name */}
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'grey.900',
                  mb: 1,
                }}
              >
                {project.name}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: 'grey.600',
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '2.5em',
                }}
              >
                {project.description}
              </Typography>

              {/* Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={project.status.replace('-', ' ')}
                  color={statusColorMap[project.status] || 'default'}
                  size="small"
                  sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'grey.500',
                    fontSize: '0.75rem',
                  }}
                >
                  {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
