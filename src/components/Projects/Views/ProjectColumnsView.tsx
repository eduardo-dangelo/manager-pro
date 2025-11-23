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
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { ProjectDetail } from '@/app/[locale]/(auth)/projects/[id]/ProjectDetail';
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

type ProjectColumnsViewProps = {
  projects: Project[];
  locale: string;
  onProjectDeleted?: (projectId: number) => void;
};

// Removed unused color and status maps after simplifying sidebar items

const projectTypeIcons = {
  vehicle: DirectionsCarIcon,
  property: HomeWorkIcon,
  cashflow: AttachMoneyIcon,
  trip: FlightIcon,
  band: MusicNoteIcon,
};

// Removed route pluralization helper since we no longer navigate on click

export function ProjectColumnsView({ projects, locale, onProjectDeleted }: ProjectColumnsViewProps) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedProjectId, setClickedProjectId] = useState<number | null>(null);
  const isMobile = useMediaQuery('(max-width:930px)');
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();

  // Clear clicked state when selectedProject changes (project loads)
  useEffect(() => {
    if (selectedProject) {
      setClickedProjectId(null);
    }
  }, [selectedProject]);

  if (isMobile) {
    return null;
  }

  const loadProject = async (projectId: number) => {
    try {
      setIsLoading(true);
      setSelectedProject(null);
      const res = await fetch(`/${locale}/api/projects/${projectId}`);
      if (!res.ok) {
        throw new Error('Failed to load project');
      }
      const { project } = await res.json();
      setSelectedProject(project);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fade in={true} unmountOnExit>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{
          'width': 320,
          'borderRadius': 2,
          'border': 1,
          'borderColor': 'divider',
          'overflowY': 'auto',
          'bgcolor': 'background.paper',
          'p': 1,
          'maxHeight': 'calc(100vh - 180px)', // Account for GlobalTopbar (~58px) + ProjectsTopBar (~50px) + margins (~72px)
          'mb': 2,
          // Custom thin scrollbar
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            'background': theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)',
            'borderRadius': '3px',
            '&:hover': {
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.12)',
            },
          },
          // Firefox scrollbar
          'scrollbarWidth': 'thin',
          'scrollbarColor': theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08) transparent'
            : 'rgba(0, 0, 0, 0.08) transparent',
        }}
        >
          <List sx={{ px: 0, py: 0 }}>
            <TransitionGroup component={null}>
              {projects.map((project) => {
                const ProjectIcon = projectTypeIcons[project.type as keyof typeof projectTypeIcons] || FolderIcon;
                // If a project was clicked, only that project should be active (optimistic UI update)
                // This ensures the previous active item loses its active state immediately
                const isActive = clickedProjectId
                  ? clickedProjectId === project.id
                  : selectedProject?.id === project.id;

                return (
                  <Collapse key={project.id} timeout={300}>
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => {
                          if (selectedProject?.id === project.id) {
                            setSelectedProject(null);
                            setClickedProjectId(null);
                            return;
                          }
                          setClickedProjectId(project.id);
                          loadProject(project.id);
                        }}
                        onMouseEnter={playHoverSound}
                        sx={{
                          'borderRadius': 2,
                          'color': isActive ? theme.palette.text.primary : theme.palette.text.secondary,
                          'bgcolor': isActive ? (theme.palette.mode === 'dark' ? theme.palette.action.selected : theme.palette.action.selected) : 'transparent',
                          'pl': 2,
                          'pr': 2,
                          'py': 0.5,
                          // 'boxShadow': isActive ? '0 4px 26px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)' : 'none',
                          'transition': 'boxShadow 0.3s ease-in-out',
                          '&:hover': {
                            'bgcolor': theme.palette.mode === 'dark' ? theme.palette.action.selected : theme.palette.action.hover,
                            'color': theme.palette.text.primary,
                            // 'boxShadow': isActive ? theme.shadows[40] : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                            '& .MuiListItemIcon-root': {
                              color: theme.palette.primary.main,
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <ProjectIcon
                            sx={{
                              fontSize: 20,
                              color: theme.palette.primary.main,
                              transition: 'color 0.2s',
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={project.name.length > 30 ? `${project.name.slice(0, 40)}…` : project.name}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Collapse>
                );
              })}
            </TransitionGroup>
          </List>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', px: 2 }}>
          {!selectedProject && (
            <Box sx={{
              // border: 1,
              // borderColor: 'grey.200',
              // borderRadius: 2,
              // bgcolor: 'white',
              p: 3,
              color: 'grey.600',
            }}
            >
              {isLoading
                ? (
                    <>
                      <Skeleton variant="text" width={200} height={38} />
                      <Skeleton variant="rectangular" height={100} sx={{ mt: 3, borderRadius: 1 }} />
                    </>
                  )
                : (
                    <Typography variant="body1">Select a project to see details</Typography>
                  )}
            </Box>
          )}
          {selectedProject && (
            <ProjectDetail
              project={selectedProject}
              locale={locale}
              hideBreadcrumb
              headerActions={(
                <ProjectActions
                  projectId={selectedProject.id}
                  locale={locale}
                  onDeleted={() => {
                    setSelectedProject(null);
                    onProjectDeleted?.(selectedProject.id);
                  }}
                  onCompleted={() => setSelectedProject({ ...selectedProject, status: 'completed' })}
                />
              )}
            />
          )}
        </Box>
      </Box>
    </Fade>
  );
}
