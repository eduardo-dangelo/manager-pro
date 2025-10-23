'use client';

import { Add as AddIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText, Tab, Tabs } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CalendarTab } from './CalendarTab';
import { ObjectivesTab } from './ObjectivesTab';
import { ReportTab } from './ReportTab';
import { SettingsTab } from './SettingsTab';
import { SprintsTab } from './SprintsTab';
import { TimelineTab } from './TimelineTab';
import { TodosTab } from './TodosTab';

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

type ProjectTabsProps = {
  project: Project;
  locale: string;
  onUpdateProject: (project: Project) => void;
};

export function ProjectTabs({ project, locale, onUpdateProject }: ProjectTabsProps) {
  const t = useTranslations('Projects');
  const [currentTab, setCurrentTab] = useState(0);
  const [addTabDialogOpen, setAddTabDialogOpen] = useState(false);

  // Define all available tabs
  const availableTabs = ['overview', 'todos', 'calendar', 'sprints', 'docs', 'musics', 'timeline', 'insights'];

  // Get project's current tabs (default to ['overview'] if not set)
  const projectTabs = project.tabs || ['overview'];

  // Find tabs that haven't been added yet
  const remainingTabs = availableTabs.filter(tab => !projectTabs.includes(tab));

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddTab = async (tabName: string) => {
    try {
      const newTabs = [...projectTabs, tabName];
      
      const response = await fetch(`/${locale}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabs: newTabs }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tab');
      }

      const { project: updatedProject } = await response.json();
      onUpdateProject({ ...project, tabs: updatedProject.tabs });
      setAddTabDialogOpen(false);
    } catch (error) {
      console.error('Error adding tab:', error);
    }
  };

  const renderTabContent = (tabName: string) => {
    switch (tabName) {
      case 'overview':
        return (
          <ObjectivesTab
            project={project}
            locale={locale}
            onUpdateProject={onUpdateProject}
          />
        );
      case 'todos':
        return (
          <TodosTab
            project={project}
            locale={locale}
            onUpdateProject={onUpdateProject}
          />
        );
      case 'sprints':
        return (
          <SprintsTab
            project={project}
            locale={locale}
            onUpdateProject={onUpdateProject}
          />
        );
      case 'calendar':
        return <CalendarTab project={project} />;
      case 'timeline':
        return <TimelineTab project={project} />;
      case 'insights':
        return <ReportTab project={project} />;
      case 'docs':
      case 'musics':
        return (
          <Box sx={{ p: 3, textAlign: 'center', color: 'grey.500' }}>
            {t(`tabs_${tabName}`)} - Coming soon
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            'flex': 1,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.938rem',
              fontWeight: 500,
              minHeight: 48,
            },
          }}
        >
          {projectTabs.map((tabName) => (
            <Tab key={tabName} label={t(`tabs_${tabName}`)} />
          ))}
        </Tabs>
        {remainingTabs.length > 0 && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddTabDialogOpen(true)}
            sx={{
              'textTransform': 'none',
              'color': 'grey.600',
              'minWidth': 'auto',
              'px': 2,
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            {t('add_tab')}
          </Button>
        )}
      </Box>

      <Box>
        {projectTabs.map((tabName, index) => (
          <Box key={tabName} sx={{ display: currentTab === index ? 'block' : 'none' }}>
            {renderTabContent(tabName)}
          </Box>
        ))}
      </Box>

      {/* Add Tab Dialog */}
      <Dialog open={addTabDialogOpen} onClose={() => setAddTabDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('select_tab')}</DialogTitle>
        <DialogContent>
          <List>
            {remainingTabs.map((tabName) => (
              <ListItem key={tabName} disablePadding>
                <ListItemButton onClick={() => handleAddTab(tabName)}>
                  <ListItemText primary={t(`tabs_${tabName}`)} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTabDialogOpen(false)}>{t('cancel')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

