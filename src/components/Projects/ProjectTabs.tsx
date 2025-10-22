'use client';

import { Box, Tab, Tabs } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CalendarTab } from './CalendarTab';
import { ObjectivesTab } from './ObjectivesTab';
import { ReportTab } from './ReportTab';
import { SettingsTab } from './SettingsTab';
import { SprintsTab } from './SprintsTab';
import { TasksTab } from './TasksTab';
import { TimelineTab } from './TimelineTab';

type Task = {
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
  objectives: Objective[];
  tasks: Task[];
  sprints: Sprint[];
};

type ProjectTabsProps = {
  project: Project;
  locale: string;
  onUpdateProject: (project: Project) => void;
};

export function ProjectTabs({ project, locale, onUpdateProject }: ProjectTabsProps) {
  const t = useTranslations('Projects');
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.938rem',
              fontWeight: 500,
              minHeight: 48,
            },
          }}
        >
          <Tab label={t('tabs_objectives')} />
          <Tab label={t('tabs_tasks')} />
          <Tab label={t('tabs_sprints')} />
          <Tab label={t('tabs_calendar')} />
          <Tab label={t('tabs_timeline')} />
          <Tab label={t('tabs_report')} />
          <Tab label={t('tabs_settings')} />
        </Tabs>
      </Box>

      <Box>
        {currentTab === 0 && (
          <ObjectivesTab
            project={project}
            locale={locale}
            onUpdateProject={onUpdateProject}
          />
        )}
        {currentTab === 1 && (
          <TasksTab
            project={project}
            locale={locale}
            onUpdateProject={onUpdateProject}
          />
        )}
        {currentTab === 2 && (
          <SprintsTab
            project={project}
            locale={locale}
            onUpdateProject={onUpdateProject}
          />
        )}
        {currentTab === 3 && <CalendarTab project={project} />}
        {currentTab === 4 && <TimelineTab project={project} />}
        {currentTab === 5 && <ReportTab project={project} />}
        {currentTab === 6 && (
          <SettingsTab
            projectId={project.id}
            projectName={project.name}
            locale={locale}
          />
        )}
      </Box>
    </Box>
  );
}

