'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProjectHeader } from '@/components/Projects/ProjectHeader';
import { ProjectTabs } from '@/components/Projects/Project/ProjectTabs';

type Todo = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  objectiveId: number | null;
};

type Objective = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
};

type Sprint = {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  type?: string | null;
  tabs?: string[];
  objectives: Objective[];
  todos: Todo[];
  sprints: Sprint[];
};

export function ProjectDetail({
  project: initialProject,
  locale,
}: {
  project: Project;
  locale: string;
}) {
  const t = useTranslations('Projects');
  const dashboardT = useTranslations('DashboardLayout');

  const [project, setProject] = useState(initialProject);

  const breadcrumbItems = [
    { label: dashboardT('menu_dashboard'), href: `/${locale}/dashboard` },
    { label: t('page_title'), href: `/${locale}/projects` },
    { label: project.name },
  ];

  const updateProject = async (updates: Partial<Project>) => {
    try {
      const response = await fetch(`/${locale}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const { project: updatedProject } = await response.json();
      setProject({ ...project, ...updatedProject });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: 900, width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
        <Breadcrumb items={breadcrumbItems} />

        <ProjectHeader
          project={project}
          locale={locale}
          onUpdate={updateProject}
        />

        <ProjectTabs
          project={project}
          locale={locale}
          onUpdateProject={setProject}
        />
      </Box>
    </Box>
  );
}
