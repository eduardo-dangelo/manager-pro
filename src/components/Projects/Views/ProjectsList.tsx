'use client';

import { Box, Chip, Grid, Typography } from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';
import { ProjectColumnsView } from '@/components/Projects/Views/ProjectColumnsView';
import { ProjectListView } from '@/components/Projects/Views/ProjectListView';

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

type ViewMode = 'folder' | 'list' | 'columns';
type CardSize = 'small' | 'medium' | 'large';
type SortBy = 'dateCreated' | 'dateModified' | 'name' | 'type' | 'status';

type ProjectsListProps = {
  projects: Project[];
  locale: string;
  viewMode: ViewMode;
  cardSize: CardSize;
  sortBy: SortBy;
  searchQuery: string;
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

export function ProjectsList({ projects, locale, viewMode, cardSize, sortBy, searchQuery }: ProjectsListProps) {
  // Filter projects by search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort projects based on sortBy
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'dateCreated':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'dateModified':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Get grid column sizes based on card size
  const getGridSizes = () => {
    switch (cardSize) {
      case 'small':
        return { xs: 12, sm: 6, md: 4, lg: 2.4, xl: 2 }; // Smaller cards
      case 'large':
        return { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }; // Full width alignment
      case 'medium':
      default:
        return { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }; // 3 items per row
    }
  };

  // Get card height based on card size
  const getCardHeight = () => {
    switch (cardSize) {
      case 'small':
        return '200px'; // Smaller
      case 'large':
        return '280px'; // What was medium before
      case 'medium':
      default:
        return '240px'; // Smaller than before
    }
  };

  // Get font sizes based on card size
  const getFontSizes = () => {
    switch (cardSize) {
      case 'small':
        return {
          title: '1rem',
          description: '0.75rem',
          caption: '0.6875rem',
        };
      case 'large':
        return {
          title: '1.125rem', // What was medium before
          description: '0.75rem',
          caption: '0.75rem',
        };
      case 'medium':
      default:
        return {
          title: '1rem',
          description: '0.75rem',
          caption: '0.6875rem',
        };
    }
  };

  const gridSizes = getGridSizes();
  const cardHeight = getCardHeight();
  const fontSizes = getFontSizes();

  // Render different views
  if (viewMode === 'list') {
    return <ProjectListView projects={sortedProjects} locale={locale} />;
  }

  if (viewMode === 'columns') {
    return <ProjectColumnsView projects={sortedProjects} locale={locale} />;
  }

  // Default folder view
  return (
    <Grid container spacing={3}>
      {sortedProjects.map(project => (
        <Grid
          item
          xs={gridSizes.xs}
          sm={gridSizes.sm}
          md={gridSizes.md}
          lg={gridSizes.lg}
          xl={gridSizes.xl}
          key={project.id}
          {...({} as any)}
        >
          <Box
            component={Link}
            href={`/${locale}/projects/${pluralizeType(project.type)}/${project.id}`}
            sx={{
              'textDecoration': 'none',
              'cursor': 'pointer',
              'display': 'block',
              'perspective': '1000px',
              'position': 'relative',
              'height': cardHeight,
              'minWidth': cardSize === 'small' ? '200px' : cardSize === 'large' ? '300px' : '250px',
              'paddingTop': '20px',
              '&:hover .folder-tab': {
                // transform: 'rotateX(-10deg)',
              },
              '&:hover .folder-body': {
                // transform: 'translateY(-4px)',
                // transform: 'rotateX(-10deg)',
                transformOrigin: 'bottom',
                // boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              },
            }}
          >
            {/* Folder Tab */}
            <Box
              className="folder-tab"
              sx={{
                position: 'absolute',
                top: -2,
                left: 0,

                width: '140px',
                height: '24px',
                bgcolor: 'white',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                border: 1,
                borderColor: 'grey.200',
                borderBottom: 'none',
                transformOrigin: 'bottom',
                transition: 'all 0.3s ease',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Color chip inside tab */}
              <Box
                sx={{
                  width: '60px',
                  height: '6px',
                  bgcolor: colorMap[project.color] || colorMap.gray,
                  borderRadius: 1,
                }}
              />
            </Box>

            {/* Folder Body */}
            <Box
              className="folder-body"
              sx={{
                position: 'absolute',
                top: '20px',
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'white',
                border: 1,
                borderColor: 'grey.200',
                borderRadius: '12px',
                borderTopLeftRadius: '0px',
                p: 3,
                pb: 2.5,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                transformOrigin: 'top',
                // boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              {/* Project name */}
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontSize: fontSizes.title,
                  fontWeight: 600,
                  color: 'grey.900',
                  mb: 1,
                  mt: 0.5,
                }}
              >
                {project.name}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: fontSizes.description,
                  color: 'grey.600',
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '2.5em',
                  flexGrow: 1,
                }}
              >
                {project.description}
              </Typography>

              {/* Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
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
                    fontSize: fontSizes.caption,
                  }}
                >
                  {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
