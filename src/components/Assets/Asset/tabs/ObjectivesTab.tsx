'use client';

import { Add as AddIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material';
import { Box, Button, LinearProgress, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { ObjectiveItem } from '@/components/Assets/Asset/tabs/ObjectiveItem';

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

type Asset = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  objectives: Objective[];
  todos: Task[];
};

type ObjectivesTabProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

export function ObjectivesTab({ asset, locale, onUpdateAsset }: ObjectivesTabProps) {
  const t = useTranslations('Assets');
  const newObjectiveRef = useRef<HTMLInputElement>(null);
  const objectiveRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const taskRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const newTaskRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [expandedObjective, setExpandedObjective] = useState<number | null>(null);
  const [hoveredObjective, setHoveredObjective] = useState<number | null>(null);
  const [newObjective, setNewObjective] = useState({ name: '', description: '' });
  const [addingObjective, setAddingObjective] = useState(false);
  const [newTask, setNewTask] = useState<Record<number, { name: string; description: string }>>({});
  const [addingTask, setAddingTask] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (addingObjective && newObjectiveRef.current) {
      newObjectiveRef.current.focus();
    }
  }, [addingObjective]);

  const getObjectiveTasks = (objectiveId: number) =>
    asset.todos.filter(task => task.objectiveId === objectiveId);

  const getOverallObjectivesProgress = () => {
    if (asset.objectives.length === 0) {
      return 0;
    }
    const completed = asset.objectives.filter(obj => obj.status === 'completed').length;
    return (completed / asset.objectives.length) * 100;
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
          assetId: asset.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create objective');
      }

      const { objective } = await response.json();
      onUpdateAsset({
        ...asset,
        objectives: [...asset.objectives, objective],
      });
      setNewObjective({ name: '', description: '' });
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

      onUpdateAsset({
        ...asset,
        objectives: asset.objectives.filter(obj => obj.id !== objectiveId),
        todos: asset.todos.filter(task => task.objectiveId !== objectiveId),
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

      onUpdateAsset({
        ...asset,
        objectives: asset.objectives.map(obj =>
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

      onUpdateAsset({
        ...asset,
        objectives: asset.objectives.map(obj =>
          obj.id === objectiveId ? { ...obj, name } : obj,
        ),
      });
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const updateObjectivePriority = async (objectiveId: number, priority: string) => {
    try {
      const response = await fetch(`/${locale}/api/objectives/${objectiveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });

      if (!response.ok) {
        throw new Error('Failed to update objective');
      }

      onUpdateAsset({
        ...asset,
        objectives: asset.objectives.map(obj =>
          obj.id === objectiveId ? { ...obj, priority } : obj,
        ),
      });
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const updateObjectiveDates = async (objectiveId: number, startDate: Date | null | undefined, dueDate: Date | null | undefined) => {
    try {
      const response = await fetch(`/${locale}/api/objectives/${objectiveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, dueDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to update objective');
      }

      onUpdateAsset({
        ...asset,
        objectives: asset.objectives.map(obj =>
          obj.id === objectiveId ? { ...obj, startDate, dueDate } : obj,
        ),
      });
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const updateObjectiveDescription = async (objectiveId: number, description: string) => {
    try {
      const response = await fetch(`/${locale}/api/objectives/${objectiveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error('Failed to update objective description');
      }

      onUpdateAsset({
        ...asset,
        objectives: asset.objectives.map(obj =>
          obj.id === objectiveId ? { ...obj, description } : obj,
        ),
      });
    } catch (error) {
      console.error('Error updating objective description:', error);
    }
  };

  const addTask = async (objectiveId: number) => {
    const taskData = newTask[objectiveId];
    if (!taskData || !taskData.name.trim()) {
      return;
    }

    try {
      const response = await fetch(`/${locale}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          assetId: asset.id,
          objectiveId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const { todo } = await response.json();
      onUpdateAsset({
        ...asset,
        todos: [...asset.todos, todo],
      });
      setNewTask({ ...newTask, [objectiveId]: { name: '', description: '' } });
      if (newTaskRefs.current[objectiveId]) {
        newTaskRefs.current[objectiveId]?.focus();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`/${locale}/api/todos/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      onUpdateAsset({
        ...asset,
        todos: asset.todos.map(task =>
          task.id === taskId ? { ...task, status } : task,
        ),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const updateTaskName = async (taskId: number, name: string) => {
    try {
      const response = await fetch(`/${locale}/api/todos/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      onUpdateAsset({
        ...asset,
        todos: asset.todos.map(task =>
          task.id === taskId ? { ...task, name } : task,
        ),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/${locale}/api/todos/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      onUpdateAsset({
        ...asset,
        todos: asset.todos.filter(task => task.id !== taskId),
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
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
        {asset.objectives.length > 0 && (
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

      {asset.objectives.length === 0 && !addingObjective
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
              {t('no_objectives')}
            </Typography>
          )
        : (
            asset.objectives.map(objective => (
              <ObjectiveItem
                key={objective.id}
                objective={objective}
                tasks={getObjectiveTasks(objective.id)}
                locale={locale}
                isExpanded={expandedObjective === objective.id}
                isHovered={hoveredObjective === objective.id}
                onToggleExpand={() =>
                  setExpandedObjective(expandedObjective === objective.id ? null : objective.id)}
                onHoverChange={hover =>
                  setHoveredObjective(hover ? objective.id : null)}
                onUpdateStatus={status => updateObjectiveStatus(objective.id, status)}
                onUpdateName={name => updateObjectiveName(objective.id, name)}
                onUpdatePriority={priority => updateObjectivePriority(objective.id, priority)}
                onUpdateDates={(startDate, dueDate) =>
                  updateObjectiveDates(objective.id, startDate, dueDate)}
                onUpdateDescription={description =>
                  updateObjectiveDescription(objective.id, description)}
                onDelete={() => deleteObjective(objective.id)}
                onAddTask={() => setAddingTask({ ...addingTask, [objective.id]: true })}
                onUpdateTaskStatus={updateTaskStatus}
                onUpdateTaskName={updateTaskName}
                onDeleteTask={deleteTask}
                newTask={newTask[objective.id] || { name: '', description: '' }}
                addingTask={addingTask[objective.id] || false}
                onNewTaskChange={task => setNewTask({ ...newTask, [objective.id]: task })}
                onSetAddingTask={adding =>
                  setAddingTask({ ...addingTask, [objective.id]: adding })}
                onTaskSubmit={() => addTask(objective.id)}
                objectiveRef={el => (objectiveRefs.current[objective.id] = el)}
                taskRefs={taskRefs.current}
                newTaskRef={el => (newTaskRefs.current[objective.id] = el)}
                allObjectives={asset.objectives}
              />
            ))
          )}

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
    </Box>
  );
}

