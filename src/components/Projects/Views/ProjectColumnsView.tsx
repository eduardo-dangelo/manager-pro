'use client';

import {
  AttachMoney as AttachMoneyIcon,
  DirectionsCar as DirectionsCarIcon,
  Flight as FlightIcon,
  Folder as FolderIcon,
  HomeWork as HomeWorkIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import { Box, Collapse, Fade, Skeleton, Typography, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { ProjectDetail } from '@/app/[locale]/(auth)/projects/[id]/ProjectDetail';
import { ProjectActions } from '@/components/Projects/ProjectActions';

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
  const isMobile = useMediaQuery('(max-width:930px)');

  if (isMobile) {
    return null;
  }

  const loadProject = async (projectId: number) => {
    try {
      setIsLoading(true);
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
          // bgcolor: 'white',
          display: 'flex',
          alignItems: 'flex-start',
          // height: '100vh',
          // overflow: 'hidden',
          // border: 1,
          // borderColor: 'grey.200',
        }}
      >
        <Box sx={{ 
          width: 320, 
          borderRadius: 2, 
          border: 1,
          borderColor: 'grey.200', 
          overflowY: 'auto', 
          bgcolor: 'white',
          p: 1,
         }}>
          <TransitionGroup component={null}>
            {projects.map((project) => {
              const ProjectIcon = projectTypeIcons[project.type as keyof typeof projectTypeIcons] || FolderIcon;
              const isActive = selectedProject?.id === project.id;

              return (
                <Collapse key={project.id} timeout={300}>
                  <Box
                    onClick={() => {
                      if (selectedProject?.id === project.id) {
                        setSelectedProject(null);
                        return;
                      }
                      loadProject(project.id);
                    }}
                    sx={{
                      'display': 'flex',
                      'alignItems': 'center',
                      'gap': 1,
                      'px': 2,
                      'py': 1.25,
                      'cursor': 'pointer',
                      'bgcolor': isActive ? 'grey.100' : 'transparent',
                      '&:hover': { bgcolor: 'grey.100', borderRadius: 2 },
                      // 'borderBottom': '1px solid',
                      // 'borderBottomColor': 'grey.200',
                    }}
                  >
                    <ProjectIcon sx={{ fontSize: 18, color: 'grey.700' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.900' }}>
                      {project.name.length > 30 ? `${project.name.slice(0, 40)}…` : project.name}
                    </Typography>
                  </Box>
                </Collapse>
              );
            })}
          </TransitionGroup>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', px: 2 }}>
          {!selectedProject && (
            <Box sx={{
              border: 1,
              borderColor: 'grey.200',
              borderRadius: 2,
              bgcolor: 'white',
              p: 3,
              color: 'grey.600',
            }}>
              {isLoading ? (
                <>
                  <Skeleton variant="text" width={200} height={28} />
                  <Skeleton variant="rectangular" height={120} sx={{ mt: 1, borderRadius: 1 }} />
                </>
              ) : (
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
