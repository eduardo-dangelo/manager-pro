'use client';

import {
  Add as AddIcon,
  CheckBox,
  CheckBoxOutlineBlank,
  CheckCircleOutline,
  Delete as DeleteIcon,
  ExpandLess,
  ExpandMore,
  FormatListBulleted,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';

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

export function ProjectDetail({
  project: initialProject,
  locale,
}: {
  project: Project;
  locale: string;
}) {
  const t = useTranslations('Projects');
  const dashboardT = useTranslations('DashboardLayout');
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [project, setProject] = useState(initialProject);
  const [saving, setSaving] = useState(false);
  const [expandedObjective, setExpandedObjective] = useState<number | null>(
    null,
  );
  const [newObjective, setNewObjective] = useState({
    name: '',
    description: '',
  });
  const [addingObjective, setAddingObjective] = useState(false);
  const [newTask, setNewTask] = useState<
    Record<number, { name: string; description: string }>
  >({});
  const [addingTask, setAddingTask] = useState<Record<number, boolean>>({});
  const [newSprint, setNewSprint] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [addingSprint, setAddingSprint] = useState(false);

  const breadcrumbItems = [
    { label: dashboardT('menu_overview'), href: `/${locale}/dashboard` },
    { label: t('page_title'), href: `/${locale}/dashboard/projects` },
    { label: project.name },
  ];

  useEffect(() => {
    // Auto-focus title input on mount
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && descriptionRef.current) {
      e.preventDefault();
      descriptionRef.current.focus();
    }
  };

  const saveProject = async (updates: Partial<Project>) => {
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const addObjective = async () => {
    if (!newObjective.name.trim()) {
      return;
    }

    try {
      const response = await fetch(`/${locale}/api/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newObjective,
          projectId: project.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create objective');
      }

      const { objective } = await response.json();
      setProject({
        ...project,
        objectives: [...project.objectives, objective],
      });
      setNewObjective({ name: '', description: '' });
      setAddingObjective(false);
    } catch (error) {
      console.error('Error creating objective:', error);
    }
  };

  const deleteObjective = async (objectiveId: number) => {
    try {
      const response = await fetch(`/${locale}/api/objectives/${objectiveId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete objective');
      }

      setProject({
        ...project,
        objectives: project.objectives.filter(obj => obj.id !== objectiveId),
        tasks: project.tasks.filter(task => task.objectiveId !== objectiveId),
      });
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const updateObjectiveStatus = async (objectiveId: number, status: string) => {
    try {
      const response = await fetch(`/${locale}/api/objectives/${objectiveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update objective');
      }

      setProject({
        ...project,
        objectives: project.objectives.map(obj =>
          obj.id === objectiveId ? { ...obj, status } : obj,
        ),
      });
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const updateObjectiveName = async (objectiveId: number, name: string) => {
    try {
      const response = await fetch(`/${locale}/api/objectives/${objectiveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update objective');
      }

      setProject({
        ...project,
        objectives: project.objectives.map(obj =>
          obj.id === objectiveId ? { ...obj, name } : obj,
        ),
      });
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const addTask = async (objectiveId: number) => {
    const taskData = newTask[objectiveId];
    if (!taskData || !taskData.name.trim()) {
      return;
    }

    try {
      const response = await fetch(`/${locale}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          projectId: project.id,
          objectiveId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const { task } = await response.json();
      setProject({
        ...project,
        tasks: [...project.tasks, task],
      });
      setNewTask({ ...newTask, [objectiveId]: { name: '', description: '' } });
      setAddingTask({ ...addingTask, [objectiveId]: false });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`/${locale}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setProject({
        ...project,
        tasks: project.tasks.map(task =>
          task.id === taskId ? { ...task, status } : task,
        ),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/${locale}/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setProject({
        ...project,
        tasks: project.tasks.filter(task => task.id !== taskId),
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addSprint = async () => {
    if (!newSprint.name.trim()) {
      return;
    }

    try {
      const response = await fetch(`/${locale}/api/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSprint,
          projectId: project.id,
          startDate: newSprint.startDate || null,
          endDate: newSprint.endDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create sprint');
      }

      const { sprint } = await response.json();
      setProject({
        ...project,
        sprints: [...project.sprints, sprint],
      });
      setNewSprint({ name: '', description: '', startDate: '', endDate: '' });
      setAddingSprint(false);
    } catch (error) {
      console.error('Error creating sprint:', error);
    }
  };

  const deleteSprint = async (sprintId: number) => {
    try {
      const response = await fetch(`/${locale}/api/sprints/${sprintId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete sprint');
      }

      setProject({
        ...project,
        sprints: project.sprints.filter(sprint => sprint.id !== sprintId),
      });
    } catch (error) {
      console.error('Error deleting sprint:', error);
    }
  };

  const deleteProject = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('delete_confirm'))) {
      return;
    }

    try {
      const response = await fetch(`/${locale}/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      router.push(`/${locale}/dashboard/projects`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getObjectiveTasks = (objectiveId: number) =>
    project.tasks.filter(task => task.objectiveId === objectiveId);

  const getObjectiveProgress = (objectiveId: number) => {
    const tasks = getObjectiveTasks(objectiveId);
    if (tasks.length === 0) {
      return 0;
    }
    const completed = tasks.filter(task => task.status === 'done').length;
    return (completed / tasks.length) * 100;
  };

  const getOverallObjectivesProgress = () => {
    if (project.objectives.length === 0) {
      return 0;
    }
    const completed = project.objectives.filter(
      obj => obj.status === 'completed',
    ).length;
    return (completed / project.objectives.length) * 100;
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: 900, width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
        <Breadcrumb items={breadcrumbItems} />

        {/* Project Header - Editable */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            mb: 1,
          }}
        >
          <TextField
            inputRef={titleRef}
            value={project.name}
            onChange={e => setProject({ ...project, name: e.target.value })}
            onBlur={() => saveProject({ name: project.name })}
            onKeyDown={handleTitleKeyDown}
            placeholder={t('project_name')}
            variant="standard"
            sx={{
              'flex': 1,
              '& .MuiInput-root': {
                'fontSize': '2.5rem',
                'fontWeight': 700,
                'color': 'grey.900',
                '&:before': { borderBottom: 'none' },
                '&:after': { borderBottom: 'none' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
              },
              '& input': {
                padding: '8px 0',
              },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
            <Select
              value={project.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                setProject({ ...project, status: newStatus });
                saveProject({ status: newStatus });
              }}
              size="small"
              variant="standard"
              sx={{
                'fontSize': '0.813rem',
                '&:before': { borderBottom: 'none' },
                '&:after': { borderBottom: 'none' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                '& .MuiSelect-select': {
                  'py': 0.5,
                  'px': 1.5,
                  'borderRadius': 2,
                  'backgroundColor':
                    project.status === 'active'
                      ? 'primary.50'
                      : project.status === 'completed'
                        ? 'success.50'
                        : project.status === 'archived'
                          ? 'grey.100'
                          : 'warning.50',
                  'color':
                    project.status === 'active'
                      ? 'primary.700'
                      : project.status === 'completed'
                        ? 'success.700'
                        : project.status === 'archived'
                          ? 'grey.700'
                          : 'warning.700',
                  'fontWeight': 500,
                  '&:hover': {
                    backgroundColor:
                      project.status === 'active'
                        ? 'primary.100'
                        : project.status === 'completed'
                          ? 'success.100'
                          : project.status === 'archived'
                            ? 'grey.200'
                            : 'warning.100',
                  },
                },
                '& .MuiSelect-icon': {
                  color:
                    project.status === 'active'
                      ? 'primary.700'
                      : project.status === 'completed'
                        ? 'success.700'
                        : project.status === 'archived'
                          ? 'grey.700'
                          : 'warning.700',
                },
              }}
            >
              <MenuItem value="active">{t('status_active')}</MenuItem>
              <MenuItem value="completed">{t('status_completed')}</MenuItem>
              <MenuItem value="archived">{t('status_archived')}</MenuItem>
              <MenuItem value="on-hold">{t('status_on_hold')}</MenuItem>
            </Select>
            {saving && (
              <Typography
                variant="caption"
                sx={{ color: 'grey.400', fontSize: '0.75rem' }}
              >
                Saving...
              </Typography>
            )}
          </Box>
        </Box>
        <TextField
          inputRef={descriptionRef}
          value={project.description}
          onChange={e =>
            setProject({ ...project, description: e.target.value })}
          onBlur={() => saveProject({ description: project.description })}
          placeholder={t('project_description')}
          variant="standard"
          fullWidth
          multiline
          rows={2}
          sx={{
            '& .MuiInput-root': {
              'fontSize': '1rem',
              'color': 'grey.600',
              '&:before': { borderBottom: 'none' },
              '&:after': { borderBottom: 'none' },
              '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
            },
            '& textarea': {
              padding: '4px 0',
            },
            'mb': 3,
          }}
        />

        {/* Objectives Section */}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, mt: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
            }}
          >
            <span>🏁</span>
            {t('objectives_title')}
          </Typography>
          {project.objectives.length > 0 && (
            <LinearProgress
              variant="determinate"
              value={getOverallObjectivesProgress()}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 1,
                backgroundColor: 'grey.100',
              }}
            />
          )}
        </Box>

        {/* eslint-disable-next-line style/multiline-ternary */}
        {project.objectives.length === 0 && !addingObjective ? (
          <Typography
            variant="body2"
            sx={{
              color: 'grey.400',
              textAlign: 'center',
              py: 3,
              fontSize: '0.875rem',
            }}
          >
            {t('no_objectives')}
          </Typography>
        ) : (
          project.objectives.map((objective, index) => {
            const tasks = getObjectiveTasks(objective.id);
            const progress = getObjectiveProgress(objective.id);
            const isExpanded = expandedObjective === objective.id;
            const isLast = index === project.objectives.length - 1;

            return (
              <Accordion
                key={objective.id}
                expanded={isExpanded}
                onChange={() =>
                  setExpandedObjective(isExpanded ? null : objective.id)}
                sx={{
                  'backgroundColor': 'transparent',
                  'boxShadow': 'none',
                  'borderBottom': isLast ? 'none' : '1px solid',
                  'borderColor': 'grey.200',
                  '&:before': { display: 'none' },
                  '&:hover': {
                    backgroundColor: isExpanded ? 'transparent' : 'grey.200',
                  },
                  '&.Mui-expanded': {
                    margin: 0,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    isExpanded
                      ? (
                          <ExpandLess fontSize="small" sx={{ color: 'grey.500' }} />
                        )
                      : (
                          <ExpandMore fontSize="small" sx={{ color: 'grey.500' }} />
                        )
                  }
                  sx={{
                    'minHeight': '40px',
                    'px': 0.75,
                    'py': 0.75,
                    '& .MuiAccordionSummary-content': { my: 0 },
                    '&.Mui-focusVisible': { backgroundColor: 'transparent' },
                    '&.Mui-expanded': {
                      minHeight: '40px',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        const newStatus
                          = objective.status === 'completed'
                            ? 'active'
                            : 'completed';
                        updateObjectiveStatus(objective.id, newStatus);
                      }}
                      sx={{
                        'cursor': 'pointer',
                        'display': 'flex',
                        'alignItems': 'center',
                        'justifyContent': 'center',
                        'width': 28,
                        'height': 28,
                        'borderRadius': '50%',
                        'backgroundColor':
                          objective.status === 'completed'
                            ? 'primary.main'
                            : 'transparent',
                        'color':
                          objective.status === 'completed'
                            ? 'white'
                            : 'grey.400',
                        '&:hover': {
                          backgroundColor:
                            objective.status === 'completed'
                              ? 'primary.dark'
                              : 'grey.100',
                        },
                      }}
                    >
                      {objective.status === 'completed'
                        ? (
                            <CheckCircleOutline fontSize="small" />
                          )
                        : (
                            <RadioButtonUnchecked fontSize="small" />
                          )}
                    </Box>
                    <TextField
                      value={objective.name}
                      onChange={(e) => {
                        setProject({
                          ...project,
                          objectives: project.objectives.map(obj =>
                            obj.id === objective.id
                              ? { ...obj, name: e.target.value }
                              : obj,
                          ),
                        });
                      }}
                      onBlur={() =>
                        updateObjectiveName(objective.id, objective.name)}
                      onClick={e => e.stopPropagation()}
                      variant="standard"
                      multiline
                      sx={{
                        'width': `${Math.max(objective.name.length * 10 + 15, 115)}px`,
                        'maxWidth': '600px',
                        '& .MuiInput-root': {
                          'fontSize': '1.063rem',
                          'fontWeight': 500,
                          '&:before': { borderBottom: 'none' },
                          '&:after': { borderBottom: 'none' },
                          '&:hover:not(.Mui-disabled):before': {
                            borderBottom: 'none',
                          },
                        },
                        '& textarea': {
                          cursor: 'text',
                        },
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }} />
                    <DeleteIcon
                      fontSize="small"
                      sx={{
                        'cursor': 'pointer',
                        'color': 'grey.400',
                        'flexShrink': 0,
                        '&:hover': { color: 'error.main' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteObjective(objective.id);
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails
                  sx={{ pt: 1, pb: 1, px: 0, backgroundColor: 'transparent' }}
                >
                  <Box>
                    {tasks.length > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                          gap: 2,
                          ml: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: 'grey.700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            flexShrink: 0,
                          }}
                        >
                          <FormatListBulleted fontSize="small" />
                          Tasks
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 1,
                            backgroundColor: 'grey.300',
                          }}
                        />
                      </Box>
                    )}
                    {tasks.map(task => (
                      <Box
                        key={task.id}
                        sx={{
                          'display': 'flex',
                          'justifyContent': 'space-between',
                          'alignItems': 'center',
                          'py': 0.5,
                          'ml': 4,
                          'borderBottom': '1px solid',
                          'borderColor': 'grey.100',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flex: 1,
                          }}
                        >
                          <Box
                            onClick={() => {
                              const newStatus
                                = task.status === 'done' ? 'todo' : 'done';
                              updateTaskStatus(task.id, newStatus);
                            }}
                            sx={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color:
                                task.status === 'done'
                                  ? 'success.main'
                                  : 'grey.400',
                            }}
                          >
                            {task.status === 'done'
                              ? (
                                  <CheckBox fontSize="small" />
                                )
                              : (
                                  <CheckBoxOutlineBlank fontSize="small" />
                                )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.875rem',
                                textDecoration:
                                  task.status === 'done'
                                    ? 'line-through'
                                    : 'none',
                                color:
                                  task.status === 'done'
                                    ? 'grey.500'
                                    : 'inherit',
                              }}
                            >
                              {task.name}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                          }}
                        >
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.688rem',
                              backgroundColor: 'grey.100',
                              color: 'grey.700',
                            }}
                          />
                          <DeleteIcon
                            fontSize="small"
                            sx={{
                              'cursor': 'pointer',
                              'color': 'grey.400',
                              '&:hover': { color: 'error.main' },
                            }}
                            onClick={() => deleteTask(task.id)}
                          />
                        </Box>
                      </Box>
                    ))}

                    {addingTask[objective.id]
                      ? (
                          <Box
                            sx={{
                              mt: 1.5,
                              py: 1.5,
                              px: 2,
                              border: '1px solid',
                              borderColor: 'grey.200',
                              borderRadius: 1,
                            }}
                          >
                            <TextField
                              placeholder={t('task_name')}
                              value={newTask[objective.id]?.name || ''}
                              onChange={e =>
                                setNewTask({
                                  ...newTask,
                                  [objective.id]: {
                                    name: e.target.value,
                                    description:
                                  newTask[objective.id]?.description || '',
                                  },
                                })}
                              fullWidth
                              size="small"
                              variant="standard"
                              sx={{
                                'mb': 1,
                                '& .MuiInput-root:before': {
                                  borderBottomColor: 'grey.200',
                                },
                                '& .MuiInput-root:hover:not(.Mui-disabled):before':
                              { borderBottomColor: 'grey.300' },
                              }}
                            />
                            <TextField
                              placeholder={t('task_description')}
                              value={newTask[objective.id]?.description || ''}
                              onChange={e =>
                                setNewTask({
                                  ...newTask,
                                  [objective.id]: {
                                    name: newTask[objective.id]?.name || '',
                                    description: e.target.value,
                                  },
                                })}
                              fullWidth
                              size="small"
                              multiline
                              rows={2}
                              variant="standard"
                              sx={{
                                'mb': 1.5,
                                '& .MuiInput-root:before': {
                                  borderBottomColor: 'grey.200',
                                },
                                '& .MuiInput-root:hover:not(.Mui-disabled):before':
                              { borderBottomColor: 'grey.300' },
                              }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => addTask(objective.id)}
                                sx={{
                                  'textTransform': 'none',
                                  'fontSize': '0.813rem',
                                  'py': 0.5,
                                  'boxShadow': 'none',
                                  '&:hover': { boxShadow: 'none' },
                                }}
                              >
                                {t('save')}
                              </Button>
                              <Button
                                size="small"
                                onClick={() =>
                                  setAddingTask({
                                    ...addingTask,
                                    [objective.id]: false,
                                  })}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: '0.813rem',
                                  color: 'grey.600',
                                }}
                              >
                                {t('cancel')}
                              </Button>
                            </Box>
                          </Box>
                        )
                      : (
                          <Button
                            size="small"
                            startIcon={<AddIcon fontSize="small" />}
                            onClick={() =>
                              setAddingTask({
                                ...addingTask,
                                [objective.id]: true,
                              })}
                            sx={{
                              'mt': 1,
                              'ml': 4,
                              'textTransform': 'none',
                              'fontSize': '0.813rem',
                              'color': 'grey.600',
                              '&:hover': { backgroundColor: 'grey.50' },
                            }}
                          >
                            {t('add_task')}
                          </Button>
                        )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}

        {/* Add Objective Button and Form */}
        {addingObjective
          ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 0.75,
                  px: 0.75,
                  backgroundColor: 'grey.50',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    color: 'grey.300',
                    cursor: 'not-allowed',
                  }}
                >
                  <RadioButtonUnchecked fontSize="small" />
                </Box>
                <TextField
                  placeholder={t('objective_name')}
                  value={newObjective.name}
                  onChange={e =>
                    setNewObjective({ ...newObjective, name: e.target.value })}
                  variant="standard"
                  multiline
                  sx={{
                    'width': `${Math.max(newObjective.name.length * 10 + 15, 165)}px`,
                    'maxWidth': '600px',
                    '& .MuiInput-root': {
                      'fontSize': '1.063rem',
                      'fontWeight': 500,
                      '&:before': { borderBottom: 'none' },
                      '&:after': { borderBottom: 'none' },
                      '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                    },
                    '& textarea': {
                      cursor: 'text',
                    },
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={addObjective}
                    sx={{
                      'textTransform': 'none',
                      'fontSize': '0.813rem',
                      'py': 0.5,
                      'boxShadow': 'none',
                      '&:hover': { boxShadow: 'none' },
                    }}
                  >
                    {t('save')}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setAddingObjective(false)}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.813rem',
                      color: 'grey.600',
                    }}
                  >
                    {t('cancel')}
                  </Button>
                </Box>
              </Box>
            )
          : (
              <Button
                size="small"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => setAddingObjective(true)}
                sx={{
                  'textTransform': 'none',
                  'fontSize': '0.813rem',
                  'color': 'grey.600',
                  'mb': 1.5,
                  '&:hover': { backgroundColor: 'grey.100' },
                }}
              >
                {t('add_objective')}
              </Button>
            )}

        {/* Sprints Section */}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
            mt: 4,
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: '0.95rem' }}
          >
            {t('sprints_title')}
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => setAddingSprint(!addingSprint)}
            sx={{
              'textTransform': 'none',
              'fontSize': '0.813rem',
              'color': 'grey.600',
              '&:hover': { backgroundColor: 'grey.100' },
            }}
          >
            {t('add_sprint')}
          </Button>
        </Box>

        {addingSprint && (
          <Box
            sx={{
              mb: 2,
              py: 1.5,
              px: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1,
            }}
          >
            <TextField
              placeholder={t('sprint_name')}
              value={newSprint.name}
              onChange={e =>
                setNewSprint({ ...newSprint, name: e.target.value })}
              fullWidth
              size="small"
              variant="standard"
              sx={{
                'mb': 1,
                '& .MuiInput-root:before': { borderBottomColor: 'grey.200' },
                '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                  borderBottomColor: 'grey.300',
                },
              }}
            />
            <TextField
              placeholder={t('sprint_description')}
              value={newSprint.description}
              onChange={e =>
                setNewSprint({ ...newSprint, description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
              variant="standard"
              sx={{
                'mb': 1.5,
                '& .MuiInput-root:before': { borderBottomColor: 'grey.200' },
                '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                  borderBottomColor: 'grey.300',
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField
                placeholder={t('sprint_start_date')}
                type="date"
                value={newSprint.startDate}
                onChange={e =>
                  setNewSprint({ ...newSprint, startDate: e.target.value })}
                fullWidth
                size="small"
                variant="standard"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInput-root:before': { borderBottomColor: 'grey.200' },
                  '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                    borderBottomColor: 'grey.300',
                  },
                }}
              />
              <TextField
                placeholder={t('sprint_end_date')}
                type="date"
                value={newSprint.endDate}
                onChange={e =>
                  setNewSprint({ ...newSprint, endDate: e.target.value })}
                fullWidth
                size="small"
                variant="standard"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInput-root:before': { borderBottomColor: 'grey.200' },
                  '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                    borderBottomColor: 'grey.300',
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={addSprint}
                sx={{
                  'textTransform': 'none',
                  'fontSize': '0.813rem',
                  'py': 0.5,
                  'boxShadow': 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                {t('save')}
              </Button>
              <Button
                size="small"
                onClick={() => setAddingSprint(false)}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.813rem',
                  color: 'grey.600',
                }}
              >
                {t('cancel')}
              </Button>
            </Box>
          </Box>
        )}

        {project.sprints.length === 0 && !addingSprint
          ? (
              <Typography
                variant="body2"
                sx={{
                  color: 'grey.400',
                  textAlign: 'center',
                  py: 3,
                  fontSize: '0.875rem',
                }}
              >
                {t('no_sprints')}
              </Typography>
            )
          : (
              project.sprints.map(sprint => (
                <Box
                  key={sprint.id}
                  sx={{
                    'py': 1.5,
                    'px': 2,
                    'borderBottom': '1px solid',
                    'borderColor': 'grey.200',
                    'display': 'flex',
                    'justifyContent': 'space-between',
                    'alignItems': 'center',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { backgroundColor: 'grey.50' },
                  }}
                >
                  <Box
                    sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.938rem',
                        minWidth: '200px',
                        flexShrink: 0,
                      }}
                    >
                      {sprint.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'grey.600', fontSize: '0.813rem', flex: 1 }}
                    >
                      {sprint.description}
                    </Typography>
                    {sprint.startDate && sprint.endDate && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'grey.500',
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {new Date(sprint.startDate).toLocaleDateString()}
                        {' '}
                        -
                        {new Date(sprint.endDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}
                  >
                    <Chip
                      label={sprint.status}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.688rem',
                        backgroundColor: 'grey.100',
                        color: 'grey.700',
                      }}
                    />
                    <DeleteIcon
                      fontSize="small"
                      sx={{
                        'cursor': 'pointer',
                        'color': 'grey.400',
                        '&:hover': { color: 'error.main' },
                      }}
                      onClick={() => deleteSprint(sprint.id)}
                    />
                  </Box>
                </Box>
              ))
            )}

        {/* Settings Section */}

        <Box
          sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, mb: 2, fontSize: '0.95rem' }}
          >
            {t('settings_title')}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon fontSize="small" />}
            onClick={deleteProject}
            sx={{
              'textTransform': 'none',
              'fontSize': '0.813rem',
              'borderColor': 'error.light',
              'color': 'error.main',
              '&:hover': {
                borderColor: 'error.main',
                backgroundColor: 'error.50',
              },
            }}
          >
            {t('delete_project')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
