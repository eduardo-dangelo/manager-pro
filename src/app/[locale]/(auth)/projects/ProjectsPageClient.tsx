'use client';

import { Add as AddIcon, Folder as FolderIcon } from '@mui/icons-material';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { CreateProjectModal } from '@/components/Projects/CreateProjectModal';
import { ProjectsTopBar } from '@/components/Projects/ProjectsTopBar';
import { ProjectsList } from '@/components/Projects/Views/ProjectsList';

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

type ProjectsPageClientProps = {
  projects: Project[];
  locale: string;
  projectType?: string;
  userPreferences?: {
    projectsViewMode: ViewMode;
    projectsCardSize: CardSize;
    projectsSortBy: SortBy;
  };
};

export function ProjectsPageClient({ projects, locale, projectType, userPreferences }: ProjectsPageClientProps) {
  const t = useTranslations('Projects');
  const [modalOpen, setModalOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<Project[]>(projects);

  // State for view controls
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(userPreferences?.projectsViewMode || 'folder');
  const [cardSize, setCardSize] = useState<CardSize>(userPreferences?.projectsCardSize || 'medium');
  const [sortBy, setSortBy] = useState<SortBy>(userPreferences?.projectsSortBy || 'dateModified');

  // Update local state when props change (e.g., after navigation)
  useEffect(() => {
    setProjectsList(projects);
  }, [projects]);

  const handleProjectDeleted = (projectId: number) => {
    setProjectsList(prev => prev.filter(p => p.id !== projectId));
  };

  const getButtonLabel = () => {
    if (projectType) {
      return (t as any)(`new_${projectType}`);
    }
    return t('new_project');
  };

  // Mobile detection (iPhone width ~430px)
  const isMobile = useMediaQuery('(max-width:930px)');

  // Auto-switch away from columns on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'columns') {
      setViewMode('list');
    }
  }, [isMobile, viewMode]);

  // Guard: prevent switching to columns on mobile
  const handleViewModeChange = (mode: ViewMode) => {
    if (isMobile && mode === 'columns') {
      setViewMode('list');
      return;
    }
    setViewMode(mode);
  };

  return (
    <>
      <Box>
        {/* Page Header */}

        {/* Projects TopBar */}
        {projectsList.length > 0 && (
          <ProjectsTopBar
            searchQuery={searchQuery}
            viewMode={viewMode}
            cardSize={cardSize}
            sortBy={sortBy}
            onSearchChange={setSearchQuery}
            onViewModeChange={handleViewModeChange}
            onCardSizeChange={setCardSize}
            onSortByChange={setSortBy}
            onCreateProject={() => setModalOpen(true)}
            locale={locale}
            projectType={projectType}
          />
        )}

        {/* Empty State or Project List */}
        {projectsList.length === 0
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
              <ProjectsList
                projects={projectsList}
                locale={locale}
                viewMode={viewMode}
                cardSize={cardSize}
                sortBy={sortBy}
                searchQuery={searchQuery}
                onProjectDeleted={handleProjectDeleted}
              />
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
