'use client';

import {
  Add as AddIcon,
  CheckBox,
  CheckBoxOutlineBlank,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  ExpandLess,
  ExpandMore,
  FormatListBulleted,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
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
  const newObjectiveRef = useRef<HTMLInputElement>(null);
  const newTaskRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const objectiveRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const taskRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [project, setProject] = useState(initialProject);
  const [saving, setSaving] = useState(false);
  const [expandedObjective, setExpandedObjective] = useState<number | null>(
    null,
  );
  const [hoveredObjective, setHoveredObjective] = useState<number | null>(null);
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

  useEffect(() => {
    // Auto-focus new objective input when addingObjective changes
    if (addingObjective && newObjectiveRef.current) {
      newObjectiveRef.current.focus();
    }
  }, [addingObjective]);

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
      // Keep form open and refocus
      if (newObjectiveRef.current) {
        newObjectiveRef.current.focus();
      }
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
      // Keep form open and refocus
      if (newTaskRefs.current[objectiveId]) {
        newTaskRefs.current[objectiveId]?.focus();
      }
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

  const objectiveHasContent = (objective: Objective) => {
    const tasks = getObjectiveTasks(objective.id);
    return tasks.length > 0 || (objective.description && objective.description.trim().length > 0);
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
          project.objectives.map((objective) => {
            const tasks = getObjectiveTasks(objective.id);
            const progress = getObjectiveProgress(objective.id);
            const isExpanded = expandedObjective === objective.id;
            const hasContent = objectiveHasContent(objective);
            const isHovered = hoveredObjective === objective.id;

            return (
              <Accordion
                key={objective.id}
                expanded={isExpanded}
                onChange={() => {
                  setExpandedObjective(isExpanded ? null : objective.id);
                }}
                onMouseEnter={() => setHoveredObjective(objective.id)}
                onMouseLeave={() => setHoveredObjective(null)}
                sx={{
                  'backgroundColor': !isExpanded ? 'transparent' : 'grey.100',
                  'borderRadius': isExpanded ? 4 : 2,
                  'boxShadow': isExpanded ? '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)' : 'none',
                  'transition': 'border-radius 0.2s ease, box-shadow 0.2s ease',
                  '&:before': { display: 'none' },
                  '&:hover': {
                    backgroundColor: 'grey.200',
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
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Spacebar') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  sx={{
                    'minHeight': '40px',
                    'px': 0.75,
                    'py': 0.75,
                    'cursor': 'pointer',
                    '& .MuiAccordionSummary-content': { my: 0 },
                    '& .MuiAccordionSummary-expandIconWrapper': { mr: 0.75 },
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
                      // gap: 2,
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
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        mr: 1,
                        color:
                          objective.status === 'completed'
                            ? 'primary.main'
                            : 'grey.400',

                      }}
                    >
                      {objective.status === 'completed'
                        ? (
                            <CheckCircleIcon fontSize="small" />
                          )
                        : (
                            <RadioButtonUncheckedIcon fontSize="small" />
                          )}
                    </Box>
                    <TextField
                      inputRef={(el) => {
                        objectiveRefs.current[objective.id] = el;
                      }}
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
                      inputProps={{
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === ' ' || e.key === 'Spacebar') {
                            e.stopPropagation();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            // Blur the input
                            const input = objectiveRefs.current[objective.id];
                            if (input) {
                              input.blur();
                            }
                          } else if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            updateObjectiveName(objective.id, objective.name);

                            const objectiveIndex = project.objectives.findIndex(
                              obj => obj.id === objective.id,
                            );
                            const nextObjective = project.objectives[objectiveIndex + 1];

                            if (nextObjective) {
                              // Focus next objective with cursor at the end
                              setTimeout(() => {
                                const input = objectiveRefs.current[nextObjective.id];
                                if (input) {
                                  input.focus();
                                  // Move cursor to end
                                  const length = input.value.length;
                                  input.setSelectionRange(length, length);
                                }
                              }, 0);
                            } else {
                              // Last objective, open new objective form
                              setAddingObjective(true);
                            }
                          } else if ((e.key === 'Backspace' || e.key === 'Delete') && !hasContent) {
                            // If objective has no content and name is empty, delete the objective
                            if (objective.name.trim() === '') {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteObjective(objective.id);

                              // Focus previous objective if exists
                              const objectiveIndex = project.objectives.findIndex(
                                obj => obj.id === objective.id,
                              );
                              const prevObjective = project.objectives[objectiveIndex - 1];

                              if (prevObjective) {
                                setTimeout(() => {
                                  const input = objectiveRefs.current[prevObjective.id];
                                  if (input) {
                                    input.focus();
                                    const length = input.value.length;
                                    input.setSelectionRange(length, length);
                                  }
                                }, 0);
                              }
                            }
                          }
                        },
                      }}
                      sx={{
                        'width': `${Math.max(objective.name.length * 9, 100)}px`,
                        'maxWidth': '600px',
                        'minWidth': '0',
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
                    {isHovered && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          ml: 0,
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <IconButton
                          size="small"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (!isExpanded) {
                              setExpandedObjective(objective.id);
                            }
                            // TODO: Focus description field when implemented
                          }}
                          sx={{
                            'color': objective.description ? 'primary.main' : 'grey.400',
                            'padding': '4px',
                            '&:hover': {
                              color: objective.description ? 'primary.main' : 'grey.500',
                              backgroundColor: 'primary.50',
                            },
                          }}
                        >
                          <DescriptionIcon fontSize="small" />
                        </IconButton>
                        {(() => {
                          const incompleteTasks = tasks.filter(t => t.status !== 'done').length;
                          return (
                            <IconButton
                              size="small"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (!isExpanded) {
                                  setExpandedObjective(objective.id);
                                }
                                setAddingTask({ ...addingTask, [objective.id]: true });
                              }}
                              sx={{
                                'color': tasks.length > 0 ? 'primary.main' : 'grey.400',
                                'padding': '4px',
                                '&:hover': {
                                  color: tasks.length > 0 ? 'primary.main' : 'grey.500',
                                  backgroundColor: 'primary.50',
                                },
                              }}
                            >
                              <Badge
                                badgeContent={incompleteTasks > 0 ? incompleteTasks : null}
                                sx={{
                                  '& .MuiBadge-badge': {
                                    backgroundColor: 'error.light',
                                    color: 'white',
                                    fontSize: '0.625rem',
                                    height: '16px',
                                    minWidth: '16px',
                                    padding: '0 4px',
                                  },
                                }}
                              >
                                <FormatListBulleted fontSize="small" />
                              </Badge>
                            </IconButton>
                          );
                        })()}
                        <IconButton
                          size="small"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            deleteObjective(objective.id);
                          }}
                          sx={{
                            'color': 'grey.400',
                            'padding': '4px',
                            '&:hover': {
                              color: 'error.main',
                              backgroundColor: 'error.50',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails
                  sx={{ pt: 2, pb: 2, px: 2, backgroundColor: 'transparent' }}
                >
                  <Box>
                    {/* Description Section */}
                    <Box sx={{ mb: 2, ml: 2 }}>
                      <TextField
                        placeholder="Add description..."
                        value={objective.description || ''}
                        onChange={(e) => {
                          const newDescription = e.target.value;
                          setProject({
                            ...project,
                            objectives: project.objectives.map(obj =>
                              obj.id === objective.id
                                ? { ...obj, description: newDescription }
                                : obj,
                            ),
                          });
                        }}
                        onBlur={async () => {
                          try {
                            const response = await fetch(`/${locale}/api/objectives/${objective.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ description: objective.description }),
                            });
                            if (!response.ok) {
                              throw new Error('Failed to update objective description');
                            }
                          } catch (error) {
                            console.error('Error updating objective description:', error);
                          }
                        }}
                        fullWidth
                        multiline
                        rows={2}
                        variant="standard"
                        sx={{
                          '& .MuiInput-root': {
                            'fontSize': '0.875rem',
                            'color': 'grey.600',
                            '&:before': { borderBottom: 'none' },
                            '&:after': { borderBottom: 'none' },
                            '&:hover:not(.Mui-disabled):before': {
                              borderBottom: 'none',
                            },
                          },
                        }}
                      />
                    </Box>

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
                            fontWeight: 500,
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
                          <TextField
                            inputRef={(el) => {
                              taskRefs.current[task.id] = el;
                            }}
                            value={task.name}
                            onChange={(e) => {
                              setProject({
                                ...project,
                                tasks: project.tasks.map(t =>
                                  t.id === task.id
                                    ? { ...t, name: e.target.value }
                                    : t,
                                ),
                              });
                            }}
                            onBlur={async () => {
                              try {
                                const response = await fetch(`/${locale}/api/tasks/${task.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ name: task.name }),
                                });
                                if (!response.ok) {
                                  throw new Error('Failed to update task');
                                }
                              } catch (error) {
                                console.error('Error updating task:', error);
                              }
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                // Blur the input
                                const input = taskRefs.current[task.id];
                                if (input) {
                                  input.blur();
                                }
                              } else if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();

                                // Save the current task
                                try {
                                  const response = await fetch(`/${locale}/api/tasks/${task.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name: task.name }),
                                  });
                                  if (!response.ok) {
                                    throw new Error('Failed to update task');
                                  }
                                } catch (error) {
                                  console.error('Error updating task:', error);
                                }

                                const taskIndex = tasks.findIndex(t => t.id === task.id);
                                const nextTask = tasks[taskIndex + 1];

                                if (nextTask) {
                                  // Focus next task with cursor at the end
                                  setTimeout(() => {
                                    const input = taskRefs.current[nextTask.id];
                                    if (input) {
                                      input.focus();
                                      // Move cursor to end
                                      const length = input.value.length;
                                      input.setSelectionRange(length, length);
                                    }
                                  }, 0);
                                } else {
                                  // Last task, open add task form
                                  setAddingTask({ ...addingTask, [objective.id]: true });
                                }
                              }
                            }}
                            variant="standard"
                            fullWidth
                            sx={{
                              'flex': 1,
                              '& .MuiInput-root': {
                                'fontSize': '0.875rem',
                                '&:before': { borderBottom: 'none' },
                                '&:after': { borderBottom: 'none' },
                                '&:hover:not(.Mui-disabled):before': {
                                  borderBottom: 'none',
                                },
                              },
                              '& input': {
                                textDecoration:
                                  task.status === 'done'
                                    ? 'line-through'
                                    : 'none',
                                color:
                                  task.status === 'done'
                                    ? 'grey.500'
                                    : 'inherit',
                              },
                            }}
                          />
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

                    {addingTask[objective.id] && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: 0.5,
                          ml: 4,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'grey.300',
                          }}
                        >
                          <CheckBoxOutlineBlank fontSize="small" />
                        </Box>
                        <TextField
                          inputRef={(el) => {
                            newTaskRefs.current[objective.id] = el;
                          }}
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
                          onBlur={() => {
                            setAddingTask({
                              ...addingTask,
                              [objective.id]: false,
                            });
                            setNewTask({
                              ...newTask,
                              [objective.id]: { name: '', description: '' },
                            });
                          }}
                          onKeyDown={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addTask(objective.id);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setAddingTask({
                                ...addingTask,
                                [objective.id]: false,
                              });
                              setNewTask({
                                ...newTask,
                                [objective.id]: { name: '', description: '' },
                              });
                            } else if (e.key === 'Backspace' && target.value === '') {
                              e.preventDefault();
                              setAddingTask({
                                ...addingTask,
                                [objective.id]: false,
                              });
                              setNewTask({
                                ...newTask,
                                [objective.id]: { name: '', description: '' },
                              });
                            }
                          }}
                          fullWidth
                          size="small"
                          variant="standard"
                          sx={{
                            '& .MuiInput-root': {
                              'fontSize': '0.875rem',
                              '&:before': { borderBottom: 'none' },
                              '&:after': { borderBottom: 'none' },
                              '&:hover:not(.Mui-disabled):before': {
                                borderBottom: 'none',
                              },
                            },
                          }}
                        />
                      </Box>
                    )}
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
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}

        {/* Add Objective Button and Form */}
        {addingObjective && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.75,
              px: 0.75,
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
                mr: 1,
              }}
            >
              <RadioButtonUncheckedIcon fontSize="small" />
            </Box>
            <TextField
              inputRef={newObjectiveRef}
              placeholder={t('objective_name')}
              value={newObjective.name}
              onChange={e =>
                setNewObjective({ ...newObjective, name: e.target.value })}
              onBlur={() => {
                setAddingObjective(false);
                setNewObjective({ name: '', description: '' });
              }}
              onKeyDown={(e) => {
                const target = e.target as HTMLInputElement | HTMLTextAreaElement;
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addObjective();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setAddingObjective(false);
                  setNewObjective({ name: '', description: '' });
                } else if (e.key === 'Backspace' && target.value === '') {
                  e.preventDefault();
                  setAddingObjective(false);
                  setNewObjective({ name: '', description: '' });
                }
              }}
              variant="standard"
              multiline
              sx={{
                'width': `${Math.max(newObjective.name.length * 9, 165)}px`,
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
          </Box>
        )}
        <Button
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setAddingObjective(true)}
          sx={{
            'textTransform': 'none',
            'fontSize': '0.813rem',
            'color': 'grey.600',
            'mb': 1.5,
            'ml': 0.75,
            '&:hover': { backgroundColor: 'grey.100' },
          }}
        >
          {t('add_objective')}
        </Button>

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
