'use client';

import {
  AttachMoney as AttachMoneyIcon,
  DirectionsCar as DirectionsCarIcon,
  Flight as FlightIcon,
  Folder as FolderIcon,
  HomeWork as HomeWorkIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Typography,
  Avatar,
} from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectColumnsViewProps = {
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

const projectTypeIcons = {
  vehicle: DirectionsCarIcon,
  property: HomeWorkIcon,
  cashflow: AttachMoneyIcon,
  trip: FlightIcon,
  band: MusicNoteIcon,
};

// Helper function to pluralize project types for routes
const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    cashflow: 'cashflow',
    trip: 'trips',
    band: 'bands',
  };
  return pluralMap[type] || `${type}s`;
};

export function ProjectColumnsView({ projects, locale }: ProjectColumnsViewProps) {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 2,
        border: 1,
        borderColor: 'grey.200',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      {projects.map((project, index) => {
        const ProjectIcon = projectTypeIcons[project.type as keyof typeof projectTypeIcons] || FolderIcon;
        
        return (
          <Box
            key={project.id}
            component={Link}
            href={`/${locale}/projects/${pluralizeType(project.type)}/${project.id}`}
            sx={{
              'textDecoration': 'none',
              'display': 'flex',
              'p': 2,
              'borderBottom': index < projects.length - 1 ? '1px solid' : 'none',
              'borderBottomColor': 'grey.200',
              'cursor': 'pointer',
              'transition': 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: 'grey.50',
              },
            }}
          >
            {/* Left Column - Name with Icon and Color Dot */}
            <Box
              sx={{
                width: '30%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pr: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: colorMap[project.color] || colorMap.gray,
                  fontSize: '0.875rem',
                }}
              >
                <ProjectIcon sx={{ fontSize: 18, color: 'white' }} />
              </Avatar>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colorMap[project.color] || colorMap.gray,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: 'grey.900',
                  }}
                >
                  {project.name}
                </Typography>
              </Box>
            </Box>

            {/* Right Column - All other metadata */}
            <Box
              sx={{
                width: '70%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: 'grey.600',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1,
                }}
              >
                {project.description}
              </Typography>

              {/* Bottom row with status, type, progress, tasks, and date */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
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
                    textTransform: 'capitalize',
                    fontWeight: 500,
                  }}
                >
                  {project.type}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'grey.500',
                  }}
                >
                  Progress: --%
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'grey.500',
                  }}
                >
                  Tasks: --
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'grey.500',
                    ml: 'auto',
                  }}
                >
                  {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
