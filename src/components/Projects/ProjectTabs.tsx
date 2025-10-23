'use client';

import type { DragEndEvent, Modifier } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Dashboard as DashboardIcon,
  Folder as DocsIcon,
  DragIndicator as DragIcon,
  Timeline as FinanceIcon,
  Assessment as InsightsIcon,
  MusicNote as MusicsIcon,
  DirectionsRun as SprintsIcon,
  ShowChart as TimelineIcon,
  CheckBox as TodosIcon,
} from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tab, Tabs } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CalendarTab } from './CalendarTab';
import { FinanceTab } from './FinanceTab';
import { ObjectivesTab } from './ObjectivesTab';
import { ReportTab } from './ReportTab';
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

type SortableTabProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  isDragging?: boolean;
  isDraggable: boolean;
  handleTabClick: () => void;
};

function SortableTab({ id, label, icon, isDraggable, handleTabClick }: SortableTabProps) {
  const {
    attributes,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    listeners,
  } = useSortable({ id, disabled: !isDraggable });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box onClick={handleTabClick} ref={setNodeRef} style={style} component="div" sx={{ display: 'inline-block' }}>
      <Tab
        icon={icon as any}
        iconPosition="start"
        label={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <span style={{ flex: 1 }}>{label}</span>
            {isDraggable && (
              <Box
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                component="span"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                sx={{
                  'display': 'inline-flex',
                  'alignItems': 'center',
                  'flexShrink': 0,
                  'ml': 'auto',
                  'cursor': 'grab',
                  'outline': 'none',
                  'touchAction': 'none',
                  '&:hover svg': {
                    opacity: 1,
                    color: 'grey.700',
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                }}
              >
                <DragIcon
                  sx={{
                    fontSize: 18,
                    color: 'grey.500',
                    opacity: 0.8,
                    flexShrink: 0,
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            )}
          </Box>
        )}
        sx={{
          '& .MuiTab-iconWrapper': {
            marginRight: 1,
          },
        }}
      />
    </Box>
  );
}

export function ProjectTabs({ project, locale, onUpdateProject }: ProjectTabsProps) {
  const t = useTranslations('Projects');
  const [currentTab, setCurrentTab] = useState(0);
  const [addTabDialogOpen, setAddTabDialogOpen] = useState(false);

  // Define all available tabs
  const availableTabs = ['overview', 'todos', 'calendar', 'sprints', 'finance', 'docs', 'musics', 'timeline', 'insights'];

  // Get project's current tabs (default to ['overview'] if not set)
  const projectTabs = project.tabs || ['overview'];

  // Find tabs that haven't been added yet
  const remainingTabs = availableTabs.filter(tab => !projectTabs.includes(tab));

  // Modifier to restrict movement to horizontal axis only
  const restrictToHorizontalAxis: Modifier = ({ transform }) => {
    return {
      ...transform,
      y: 0,
    };
  };

  // Drag and drop sensors - remove distance constraint to allow normal clicks
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    console.log('handleTabChange', newValue);
    setCurrentTab(newValue);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Don't allow dragging the overview tab or dropping on it
    if (active.id === 'overview' || !over || active.id === over.id) {
      return;
    }

    const oldIndex = projectTabs.indexOf(active.id as string);
    const newIndex = projectTabs.indexOf(over.id as string);

    // Don't allow moving to position 0 (overview position)
    if (newIndex === 0) {
      return;
    }

    const newTabs = arrayMove(projectTabs, oldIndex, newIndex);

    // Optimistic update: Update UI immediately
    onUpdateProject({ ...project, tabs: newTabs });

    // Adjust current tab index immediately
    if (currentTab === oldIndex) {
      setCurrentTab(newIndex);
    } else if (currentTab > oldIndex && currentTab <= newIndex) {
      setCurrentTab(currentTab - 1);
    } else if (currentTab < oldIndex && currentTab >= newIndex) {
      setCurrentTab(currentTab + 1);
    }

    // Sync with API in the background
    try {
      const response = await fetch(`/${locale}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabs: newTabs }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder tabs');
      }

      // Optionally confirm with server response
      const { project: updatedProject } = await response.json();

      // If server response differs from optimistic update, sync it
      if (JSON.stringify(updatedProject.tabs) !== JSON.stringify(newTabs)) {
        onUpdateProject({ ...project, tabs: updatedProject.tabs });
      }
    } catch (error) {
      console.error('Error reordering tabs:', error);
      // Revert to original order on error
      onUpdateProject({ ...project, tabs: projectTabs });

      // Revert tab index
      if (currentTab === newIndex) {
        setCurrentTab(oldIndex);
      } else if (currentTab >= newIndex && currentTab < oldIndex) {
        setCurrentTab(currentTab + 1);
      } else if (currentTab <= newIndex && currentTab > oldIndex) {
        setCurrentTab(currentTab - 1);
      }
    }
  };

  const handleAddTab = async (tabName: string) => {
    const newTabs = [...projectTabs, tabName];

    // Optimistic update: Update UI immediately
    onUpdateProject({ ...project, tabs: newTabs });
    setAddTabDialogOpen(false);

    // Sync with API in the background
    try {
      const response = await fetch(`/${locale}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabs: newTabs }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tab');
      }

      const { project: updatedProject } = await response.json();

      // If server response differs from optimistic update, sync it
      if (JSON.stringify(updatedProject.tabs) !== JSON.stringify(newTabs)) {
        onUpdateProject({ ...project, tabs: updatedProject.tabs });
      }
    } catch (error) {
      console.error('Error adding tab:', error);
      // Revert on error
      onUpdateProject({ ...project, tabs: projectTabs });
      // Could optionally show an error message to the user here
    }
  };

  const getTabIcon = (tabName: string, iconProps?: { fontSize: number; mr?: number }) => {
    const props = iconProps || { fontSize: 18, mr: 0.5 };
    switch (tabName) {
      case 'overview':
        return <DashboardIcon sx={props} />;
      case 'todos':
        return <TodosIcon sx={props} />;
      case 'calendar':
        return <CalendarIcon sx={props} />;
      case 'sprints':
        return <SprintsIcon sx={props} />;
      case 'finance':
        return <FinanceIcon sx={props} />;
      case 'docs':
        return <DocsIcon sx={props} />;
      case 'musics':
        return <MusicsIcon sx={props} />;
      case 'timeline':
        return <TimelineIcon sx={props} />;
      case 'insights':
        return <InsightsIcon sx={props} />;
      default:
        return <DashboardIcon sx={props} />;
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
      case 'finance':
        return <FinanceTab project={project} />;
      case 'docs':
      case 'musics':
        return (
          <Box sx={{ p: 3, textAlign: 'center', color: 'grey.500' }}>
            {t(`tabs_${tabName}` as any)}
            {' '}
            - Coming soon
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <SortableContext
            items={projectTabs}
            strategy={horizontalListSortingStrategy}
          >
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
              {projectTabs.map(tabName => (
                <SortableTab
                  key={tabName}
                  id={tabName}
                  icon={getTabIcon(tabName)}
                  label={t(`tabs_${tabName}` as any)}
                  isDraggable={tabName !== 'overview'}
                  handleTabClick={() => handleTabChange(null, projectTabs.indexOf(tabName))}
                />
              ))}
            </Tabs>
          </SortableContext>
        </DndContext>
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
            {remainingTabs.map(tabName => (
              <ListItem key={tabName} disablePadding>
                <ListItemButton onClick={() => handleAddTab(tabName)}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getTabIcon(tabName, { fontSize: 20 })}
                  </ListItemIcon>
                  <ListItemText primary={t(`tabs_${tabName}` as any)} />
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
