'use client';

import {
  AttachMoney as AttachMoneyIcon,
  DirectionsCar as DirectionsCarIcon,
  Flight as FlightIcon,
  Folder as FolderIcon,
  HomeWork as HomeWorkIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { ProjectDetail } from '@/app/[locale]/(auth)/projects/[id]/ProjectDetail';

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

// Removed unused color and status maps after simplifying sidebar items

const projectTypeIcons = {
  vehicle: DirectionsCarIcon,
  property: HomeWorkIcon,
  cashflow: AttachMoneyIcon,
  trip: FlightIcon,
  band: MusicNoteIcon,
};

// Removed route pluralization helper since we no longer navigate on click

export function ProjectColumnsView({ projects, locale }: ProjectColumnsViewProps) {
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
    <Box
      sx={{
        bgcolor: 'white',
        display: 'flex',
        alignItems: 'stretch',
        height: '100vh',
        overflow: 'hidden',
        border: 1,
        borderColor: 'grey.200',
      }}
    >
      <Box sx={{ width: 320, borderRight: 1, borderColor: 'grey.200', overflowY: 'auto' }}>
        {projects.map((project) => {
          const ProjectIcon = projectTypeIcons[project.type as keyof typeof projectTypeIcons] || FolderIcon;
          const isActive = selectedProject?.id === project.id;

          return (
            <Box
              key={project.id}
              onClick={() => loadProject(project.id)}
              sx={{
                'display': 'flex',
                'alignItems': 'center',
                'gap': 1,
                'px': 2,
                'py': 1.25,
                'cursor': 'pointer',
                'bgcolor': isActive ? 'grey.100' : 'transparent',
                '&:hover': { bgcolor: 'grey.50' },
                'borderBottom': '1px solid',
                'borderBottomColor': 'grey.200',
              }}
            >
              <ProjectIcon sx={{ fontSize: 18, color: 'grey.700' }} />
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.900' }}>
                {project.name}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', p: 2 }}>
        {!selectedProject && (
          <Typography variant="h6" sx={{ color: 'grey.700' }}>
            {isLoading ? 'Loading…' : 'Select a project to see details'}
          </Typography>
        )}
        {selectedProject && (
          <ProjectDetail project={selectedProject} locale={locale} />
        )}
      </Box>
    </Box>
  );
}
