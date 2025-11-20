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
  Collapse,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
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

type ProjectListViewProps = {
  projects: Project[];
  locale: string;
  onProjectDeleted?: (projectId: number) => void;
};

// Removed status column

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

export function ProjectListView({ projects, locale, onProjectDeleted }: ProjectListViewProps) {
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();
  return (
    <Fade in={true} unmountOnExit>
      <TableContainer
        sx={{
          'bgcolor': theme.palette.background.default,
          'borderRadius': 2,
          'overflow': 'visible',
          'transition': 'box-shadow 0.2s ease',
          '&:hover': {
          // boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Table
          size="small"
          sx={{
            'width': '100%',
            // 'tableLayout': 'fixed',
            '& .MuiTableCell-root': { py: 0.75 },
          }}
        >
          <TableHead
            sx={{
              'position': 'sticky',
              'top': 102, // Position directly below GlobalTopbar (58px) + ProjectsTopBar (~50px) with no vertical gap
              'zIndex': 90,
              'bgcolor': 'background.default',
              '& th': {
                bgcolor: theme.palette.action.hover, // Ensure cells also have background
              },
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: '25%' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, display: { xs: 'none', sm: 'table-cell' }, width: '15%' }}>Type</TableCell>
              {/* Status column removed */}
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, display: { xs: 'none', sm: 'table-cell' }, width: '15%' }}>Progress</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, display: { xs: 'none', sm: 'none', md: 'table-cell' }, width: '15%' }}>Tasks</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: '20%' }}>Modified</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary, width: 80, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TransitionGroup component={null}>
              {projects.map((project, index) => {
                const ProjectIcon = projectTypeIcons[project.type as keyof typeof projectTypeIcons] || FolderIcon;

                return (
                  <Collapse
                    key={project.id}
                    timeout={300}
                    sx={{
                      '&.MuiCollapse-root': {
                        display: 'contents !important',
                      },
                      '& > .MuiCollapse-wrapper': {
                        display: 'contents !important',
                      },
                      '& > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner': {
                        display: 'contents !important',
                      },
                    }}
                  >
                    <TableRow
                      onMouseEnter={playHoverSound}
                      sx={{
                        'bgcolor': index % 2 === 1 ? theme.palette.action.hover : 'inherit',
                        'transition': 'box-shadow 0.2s ease',
                        '&:hover': {
                          'bgcolor': theme.palette.action.selected,
                          'boxShadow': `inset 0 2px 6px ${
                            theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)'
                          }`,
                          '& .MuiSvgIcon-root': {
                            color: theme.palette.primary.main,
                          },
                        },
                        '&:last-child td': {
                          borderBottom: 0,
                        },
                        'cursor': 'pointer',
                      }}
                    >
                      <TableCell sx={{ width: '25%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

                          <Box component={Link} href={`/${locale}/projects/${pluralizeType(project.type)}/${project.id}`} sx={{ textDecoration: 'none' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: theme.palette.text.primary,
                                mb: 0.25,
                              }}
                            >
                              {project.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: '15%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ProjectIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textTransform: 'capitalize' }}>
                            {project.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      {/* Status column removed */}
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: '12%' }}>
                        <Typography variant="body2" sx={{ color: 'grey.600' }}>
                          --%
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' }, width: '12%' }}>
                        <Typography variant="body2" sx={{ color: 'grey.600' }}>
                          --
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '20%' }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: 80 }} onClick={e => e.stopPropagation()}>
                        <ProjectActions
                          projectId={project.id}
                          locale={locale}
                          onDeleted={onProjectDeleted ? () => onProjectDeleted(project.id) : undefined}
                        />
                      </TableCell>
                    </TableRow>
                  </Collapse>
                );
              })}
            </TransitionGroup>
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  );
}
