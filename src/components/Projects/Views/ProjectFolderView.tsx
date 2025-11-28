'use client';

import { Box, Chip, Collapse, Fade, Grid, Typography } from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';
import { TransitionGroup } from 'react-transition-group';
import { ProjectActions } from '@/components/Projects/ProjectActions';
import { useHoverSound } from '@/hooks/useHoverSound';

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

type CardSize = 'small' | 'medium' | 'large';

type ProjectFolderViewProps = {
  projects: Project[];
  locale: string;
  cardSize: CardSize;
  onProjectDeleted?: (projectId: number) => void;
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

export function ProjectFolderView({ projects, locale, cardSize, onProjectDeleted }: ProjectFolderViewProps) {
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
        return '100px'; // Smaller height for small view
      case 'large':
        return '280px'; // What was medium before
      case 'medium':
      default:
        return '180px'; // Smaller than before
    }
  };

  // Get font sizes based on card size
  const getFontSizes = () => {
    switch (cardSize) {
      case 'small':
        return {
          title: '0.9rem',
          description: '0.7rem',
          caption: '0.625rem',
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

  const cardHeight = getCardHeight();
  const fontSizes = getFontSizes();
  const { playHoverSound } = useHoverSound();

  return (
    <Grid container spacing={cardSize === 'small' ? 0 : 2}>
      <TransitionGroup component={null}>
        {projects.map(project => (
          <Collapse orientation="horizontal" key={project.id}>

            <Box
              component={Link}
              href={`/${locale}/projects/${pluralizeType(project.type)}/${project.id}`}
              onMouseEnter={playHoverSound}
              sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'block',
                perspective: '1000px',
                padding: 0,
                width: cardSize === 'small' ? '180px' : cardSize === 'large' ? '290px' : '250px',
                transition: 'all 0.3s ease',
                '&:hover .folder-body': {
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              {/* Folder visual container */}
              <Box sx={{
                position: 'relative',
                height: cardHeight,
                width: cardSize === 'small' ? '140px' : '100%',
                mx: cardSize === 'small' ? 'auto' : undefined,
                transition: 'all 0.3s ease',

              }}
              >

                {/* Folder Body */}
                <Box
                  className="folder-body"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '12px',
                    // borderTopLeftRadius: '0px',
                    p: 3,
                    pb: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    transformOrigin: 'top',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 6, right: 6 }} onClick={e => e.preventDefault()}>
                    <ProjectActions
                      projectId={project.id}
                      locale={locale}
                      onDeleted={onProjectDeleted ? () => onProjectDeleted(project.id) : undefined}
                    />
                  </Box>
                  {/* Project name inside for non-small only */}
                  <Fade in={cardSize !== 'small'}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontSize: fontSizes.title,
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1,
                        mt: 0.5,
                      }}
                    >
                      {project.name}
                    </Typography>
                  </Fade>

                  {/* Description */}
                  <Fade in={cardSize !== 'small'}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: fontSizes.description,
                        color: 'text.secondary',
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
                  </Fade>
                  {/* Status */}
                  <Fade in={cardSize !== 'small'}>
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
                          color: 'text.secondary',
                          fontSize: fontSizes.caption,
                        }}
                      >
                        {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Fade>
                </Box>
              </Box>

              {/* Name below folder for small */}
              {/* {cardSize === 'small' && ( */}
              <Fade in={cardSize === 'small'} unmountOnExit>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    my: 1,
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {project.name}
                </Typography>
              </Fade>
              {/* )} */}
            </Box>

          </Collapse>
        ))}
      </TransitionGroup>
    </Grid>
  );
}
