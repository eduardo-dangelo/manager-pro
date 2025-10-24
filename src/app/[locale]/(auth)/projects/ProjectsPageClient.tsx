'use client';

import {
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  DirectionsCar as DirectionsCarIcon,
  Flight as FlightIcon,
  Folder as FolderIcon,
  HomeWork as HomeWorkIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CreateProjectModal } from '@/components/Projects/CreateProjectModal';
import { ProjectsList } from './ProjectsList';

// Map project types to their icons
const projectTypeIcons = {
  vehicle: DirectionsCarIcon,
  property: HomeWorkIcon,
  cashflow: AttachMoneyIcon,
  trip: FlightIcon,
  band: MusicNoteIcon,
};

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectsPageClientProps = {
  projects: Project[];
  locale: string;
  projectType?: string;
};

export function ProjectsPageClient({ projects, locale, projectType }: ProjectsPageClientProps) {
  const t = useTranslations('Projects');
  const [modalOpen, setModalOpen] = useState(false);

  // Determine button label based on project type
  const getButtonLabel = () => {
    if (projectType) {
      return t(`new_${projectType}`);
    }
    return t('new_project');
  };

  // Determine page title based on project type
  const getPageTitle = () => {
    if (projectType) {
      return t(`type_${projectType}`);
    }
    return t('page_title');
  };

  // Get icon component based on project type
  const getTitleIcon = () => {
    if (projectType) {
      return projectTypeIcons[projectType as keyof typeof projectTypeIcons];
    }
    return FolderIcon;
  };

  const TitleIcon = getTitleIcon();

  return (
    <>
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <TitleIcon sx={{ fontSize: 32, color: 'grey.700' }} />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontSize: '2rem',
                  fontWeight: 600,
                  color: 'grey.900',
                }}
              >
                {getPageTitle()}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'grey.600' }}>
              {t('page_description')}
            </Typography>
          </Box>
          {projects.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
              sx={{
                'bgcolor': '#1e293b',
                'color': 'white',
                'textTransform': 'none',
                'px': 3,
                'py': 1,
                'borderRadius': 2,
                '&:hover': {
                  bgcolor: '#0f172a',
                },
              }}
            >
              {getButtonLabel()}
            </Button>
          )}
        </Box>

        {/* Empty State or Project List */}
        {projects.length === 0
          ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <FolderIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'grey.900',
                    mb: 1,
                  }}
                >
                  {t('empty_state_title')}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'grey.600',
                    mb: 3,
                  }}
                >
                  {t('empty_state_description')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setModalOpen(true)}
                  sx={{
                    'bgcolor': '#1e293b',
                    'color': 'white',
                    'textTransform': 'none',
                    'px': 4,
                    'py': 1.5,
                    'borderRadius': 2,
                    '&:hover': {
                      bgcolor: '#0f172a',
                    },
                  }}
                >
                  {getButtonLabel()}
                </Button>
              </Box>
            )
          : (
              <ProjectsList projects={projects} locale={locale} />
            )}
      </Box>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        locale={locale}
        preSelectedType={projectType}
      />
    </>
  );
}
