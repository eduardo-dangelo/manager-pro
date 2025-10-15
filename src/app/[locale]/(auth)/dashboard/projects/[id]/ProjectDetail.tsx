'use client';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
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

export function ProjectDetail({ project: initialProject, locale }: { project: Project; locale: string }) {
  const t = useTranslations('Projects');
  const dashboardT = useTranslations('DashboardLayout');
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [project, setProject] = useState(initialProject);
  const [saving, setSaving] = useState(false);
  const [expandedObjective, setExpandedObjective] = useState<number | null>(null);
  const [newObjective, setNewObjective] = useState({ name: '', description: '' });
  const [addingObjective, setAddingObjective] = useState(false);
  const [newTask, setNewTask] = useState<Record<number, { name: string; description: string }>>({});
  const [addingTask, setAddingTask] = useState<Record<number, boolean>>({});
  const [newSprint, setNewSprint] = useState({ name: '', description: '', startDate: '', endDate: '' });
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

  return (
    <Box>
      <Breadcrumb items={breadcrumbItems} />

      {/* Project Header - Editable */}
      <Card sx={{ border: 1, borderColor: 'grey.200', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            inputRef={titleRef}
            value={project.name}
            onChange={e => setProject({ ...project, name: e.target.value })}
            onBlur={() => saveProject({ name: project.name })}
            onKeyDown={handleTitleKeyDown}
            variant="standard"
            fullWidth
            sx={{
              '& .MuiInput-root': {
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'grey.900',
              },
              'mb': 2,
            }}
          />
          <TextField
            inputRef={descriptionRef}
            value={project.description}
            onChange={e => setProject({ ...project, description: e.target.value })}
            onBlur={() => saveProject({ description: project.description })}
            variant="standard"
            fullWidth
            multiline
            rows={2}
            sx={{
              '& .MuiInput-root': {
                fontSize: '1rem',
                color: 'grey.600',
              },
              'mb': 2,
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('project_status')}</InputLabel>
              <Select
                value={project.status}
                label={t('project_status')}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setProject({ ...project, status: newStatus });
                  saveProject({ status: newStatus });
                }}
              >
                <MenuItem value="active">{t('status_active')}</MenuItem>
                <MenuItem value="completed">{t('status_completed')}</MenuItem>
                <MenuItem value="archived">{t('status_archived')}</MenuItem>
                <MenuItem value="on-hold">{t('status_on_hold')}</MenuItem>
              </Select>
            </FormControl>
            {saving && <Typography variant="caption" sx={{ alignSelf: 'center', color: 'grey.500' }}>Saving...</Typography>}
          </Box>
        </CardContent>
      </Card>

      {/* Objectives Section */}
      <Card sx={{ border: 1, borderColor: 'grey.200', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('objectives_title')}
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddingObjective(!addingObjective)}
              sx={{ textTransform: 'none' }}
            >
              {t('add_objective')}
            </Button>
          </Box>

          {addingObjective && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <TextField
                label={t('objective_name')}
                value={newObjective.name}
                onChange={e => setNewObjective({ ...newObjective, name: e.target.value })}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                label={t('objective_description')}
                value={newObjective.description}
                onChange={e => setNewObjective({ ...newObjective, description: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={2}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={addObjective} sx={{ textTransform: 'none' }}>
                  {t('save')}
                </Button>
                <Button size="small" onClick={() => setAddingObjective(false)} sx={{ textTransform: 'none' }}>
                  {t('cancel')}
                </Button>
              </Box>
            </Box>
          )}

          {project.objectives.length === 0 && !addingObjective
            ? (
                <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center', py: 2 }}>
                  {t('no_objectives')}
                </Typography>
              )
            : (
                project.objectives.map((objective) => {
                  const tasks = getObjectiveTasks(objective.id);
                  const progress = getObjectiveProgress(objective.id);
                  const isExpanded = expandedObjective === objective.id;

                  return (
                    <Accordion
                      key={objective.id}
                      expanded={isExpanded}
                      onChange={() => setExpandedObjective(isExpanded ? null : objective.id)}
                      sx={{ 'border': 1, 'borderColor': 'grey.200', 'mb': 1, '&:before': { display: 'none' } }}
                    >
                      <AccordionSummary expandIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}>
                        <Box sx={{ width: '100%', pr: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontWeight: 500 }}>{objective.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: 'grey.600' }}>
                                {t('tasks_completed', { completed: tasks.filter(t => t.status === 'done').length, total: tasks.length })}
                              </Typography>
                              <DeleteIcon
                                fontSize="small"
                                sx={{ 'cursor': 'pointer', 'color': 'grey.500', '&:hover': { color: 'error.main' } }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteObjective(objective.id);
                                }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
                            />
                            <Typography variant="caption" sx={{ color: 'grey.600', minWidth: 40 }}>
                              {Math.round(progress)}
                              %
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ pl: 2 }}>
                          {tasks.map(task => (
                            <Box
                              key={task.id}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1,
                                borderBottom: 1,
                                borderColor: 'grey.100',
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2">{task.name}</Typography>
                                {task.description && (
                                  <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                    {task.description}
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip label={task.priority} size="small" />
                                <Select
                                  value={task.status}
                                  onChange={e => updateTaskStatus(task.id, e.target.value)}
                                  size="small"
                                  sx={{ minWidth: 120 }}
                                >
                                  <MenuItem value="todo">{t('status_todo')}</MenuItem>
                                  <MenuItem value="in-progress">{t('status_in_progress')}</MenuItem>
                                  <MenuItem value="review">{t('status_review')}</MenuItem>
                                  <MenuItem value="done">{t('status_done')}</MenuItem>
                                  <MenuItem value="blocked">{t('status_blocked')}</MenuItem>
                                </Select>
                                <DeleteIcon
                                  fontSize="small"
                                  sx={{ 'cursor': 'pointer', 'color': 'grey.500', '&:hover': { color: 'error.main' } }}
                                  onClick={() => deleteTask(task.id)}
                                />
                              </Box>
                            </Box>
                          ))}

                          {addingTask[objective.id]
                            ? (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                  <TextField
                                    label={t('task_name')}
                                    value={newTask[objective.id]?.name || ''}
                                    onChange={e =>
                                      setNewTask({
                                        ...newTask,
                                        [objective.id]: { ...newTask[objective.id], name: e.target.value },
                                      })}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 1 }}
                                  />
                                  <TextField
                                    label={t('task_description')}
                                    value={newTask[objective.id]?.description || ''}
                                    onChange={e =>
                                      setNewTask({
                                        ...newTask,
                                        [objective.id]: { ...newTask[objective.id], description: e.target.value },
                                      })}
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                    sx={{ mb: 1 }}
                                  />
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => addTask(objective.id)}
                                      sx={{ textTransform: 'none' }}
                                    >
                                      {t('save')}
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() => setAddingTask({ ...addingTask, [objective.id]: false })}
                                      sx={{ textTransform: 'none' }}
                                    >
                                      {t('cancel')}
                                    </Button>
                                  </Box>
                                </Box>
                              )
                            : (
                                <Button
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => setAddingTask({ ...addingTask, [objective.id]: true })}
                                  sx={{ mt: 1, textTransform: 'none' }}
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
        </CardContent>
      </Card>

      {/* Sprints Section */}
      <Card sx={{ border: 1, borderColor: 'grey.200', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('sprints_title')}
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddingSprint(!addingSprint)}
              sx={{ textTransform: 'none' }}
            >
              {t('add_sprint')}
            </Button>
          </Box>

          {addingSprint && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <TextField
                label={t('sprint_name')}
                value={newSprint.name}
                onChange={e => setNewSprint({ ...newSprint, name: e.target.value })}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                label={t('sprint_description')}
                value={newSprint.description}
                onChange={e => setNewSprint({ ...newSprint, description: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={2}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label={t('sprint_start_date')}
                  type="date"
                  value={newSprint.startDate}
                  onChange={e => setNewSprint({ ...newSprint, startDate: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label={t('sprint_end_date')}
                  type="date"
                  value={newSprint.endDate}
                  onChange={e => setNewSprint({ ...newSprint, endDate: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={addSprint} sx={{ textTransform: 'none' }}>
                  {t('save')}
                </Button>
                <Button size="small" onClick={() => setAddingSprint(false)} sx={{ textTransform: 'none' }}>
                  {t('cancel')}
                </Button>
              </Box>
            </Box>
          )}

          {project.sprints.length === 0 && !addingSprint
            ? (
                <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center', py: 2 }}>
                  {t('no_sprints')}
                </Typography>
              )
            : (
                project.sprints.map(sprint => (
                  <Box
                    key={sprint.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'grey.200',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 500 }}>{sprint.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'grey.600' }}>
                          {sprint.description}
                        </Typography>
                        {sprint.startDate && sprint.endDate && (
                          <Typography variant="caption" sx={{ color: 'grey.500' }}>
                            {new Date(sprint.startDate).toLocaleDateString()}
                            {' '}
                            -
                            {new Date(sprint.endDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip label={sprint.status} size="small" />
                        <DeleteIcon
                          fontSize="small"
                          sx={{ 'cursor': 'pointer', 'color': 'grey.500', '&:hover': { color: 'error.main' } }}
                          onClick={() => deleteSprint(sprint.id)}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card sx={{ border: 1, borderColor: 'grey.200', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {t('settings_title')}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={deleteProject}
            sx={{ textTransform: 'none' }}
          >
            {t('delete_project')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
