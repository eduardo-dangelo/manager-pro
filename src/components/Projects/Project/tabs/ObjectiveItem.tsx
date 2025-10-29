'use client';

import {
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  CheckBox,
  CheckBoxOutlineBlank,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  ExpandLess,
  ExpandMore,
  Flag as FlagIcon,
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
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

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

type ObjectiveItemProps = {
  objective: Objective;
  tasks: Task[];
  locale: string;
  isExpanded: boolean;
  isHovered: boolean;
  onToggleExpand: () => void;
  onHoverChange: (hover: boolean) => void;
  onUpdateStatus: (status: string) => void;
  onUpdateName: (name: string) => void;
  onUpdatePriority: (priority: string) => void;
  onUpdateDates: (startDate: Date | null | undefined, dueDate: Date | null | undefined) => void;
  onUpdateDescription: (description: string) => void;
  onDelete: () => void;
  onAddTask: () => void;
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onUpdateTaskName: (taskId: number, name: string) => void;
  onDeleteTask: (taskId: number) => void;
  newTask: { name: string; description: string };
  addingTask: boolean;
  onNewTaskChange: (task: { name: string; description: string }) => void;
  onSetAddingTask: (adding: boolean) => void;
  onTaskSubmit: () => void;
  objectiveRef: (el: HTMLInputElement | null) => void;
  taskRefs: Record<number, HTMLInputElement | null>;
  newTaskRef: (el: HTMLInputElement | null) => void;
  allObjectives: Objective[];
  onNavigateObjective?: (direction: 'next' | 'prev') => void;
};

export function ObjectiveItem({
  objective,
  tasks,
  locale,
  isExpanded,
  isHovered,
  onToggleExpand,
  onHoverChange,
  onUpdateStatus,
  onUpdateName,
  onUpdatePriority,
  onUpdateDates,
  onUpdateDescription,
  onDelete,
  onAddTask,
  onUpdateTaskStatus,
  onUpdateTaskName,
  onDeleteTask,
  newTask,
  addingTask,
  onNewTaskChange,
  onSetAddingTask,
  onTaskSubmit,
  objectiveRef,
  taskRefs,
  newTaskRef,
}: ObjectiveItemProps) {
  const t = useTranslations('Projects');
  const [localObjective, setLocalObjective] = useState(objective);

  const progress = tasks.length === 0 ? 0 : (tasks.filter(task => task.status === 'done').length / tasks.length) * 100;
  const hasContent = tasks.length > 0 || (objective.description && objective.description.trim().length > 0);
  const incompleteTasks = tasks.filter(t => t.status !== 'done').length;

  return (
    <Accordion
      expanded={isExpanded}
      onChange={onToggleExpand}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
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
            ? <ExpandLess fontSize="small" sx={{ color: 'grey.500' }} />
            : <ExpandMore fontSize="small" sx={{ color: 'grey.500' }} />
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
          }}
        >
          <Box
            onClick={(e) => {
              e.stopPropagation();
              const newStatus = objective.status === 'completed' ? 'active' : 'completed';
              onUpdateStatus(newStatus);
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
              color: objective.status === 'completed' ? 'primary.main' : 'grey.400',
            }}
          >
            {objective.status === 'completed'
              ? <CheckCircleIcon fontSize="small" />
              : <RadioButtonUncheckedIcon fontSize="small" />}
          </Box>
          <TextField
            inputRef={objectiveRef}
            value={localObjective.name}
            onChange={(e) => {
              setLocalObjective({ ...localObjective, name: e.target.value });
            }}
            onBlur={() => onUpdateName(localObjective.name)}
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
                  const input = e.target as HTMLInputElement;
                  if (input) {
                    input.blur();
                  }
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpdateName(localObjective.name);
                  // Navigation will be handled by parent component
                } else if ((e.key === 'Backspace' || e.key === 'Delete') && !hasContent) {
                  if (objective.name.trim() === '') {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }
                }
              },
            }}
            sx={{
              'width': `${Math.max(localObjective.name.length * 9, 100)}px`,
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
                    onToggleExpand();
                  }
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
              <IconButton
                size="small"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (!isExpanded) {
                    onToggleExpand();
                  }
                  onSetAddingTask(true);
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
              <IconButton
                size="small"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete();
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
        sx={{ pt: 1, pb: 2, px: 2, backgroundColor: 'transparent' }}
      >
        <Box>
          {/* Action Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              ml: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Priority Chip */}
            <Chip
              icon={<FlagIcon sx={{ fontSize: '0.85rem' }} />}
              label={(
                <Select
                  value={objective.priority || 'medium'}
                  onChange={(e) => {
                    const newPriority = e.target.value;
                    setLocalObjective({ ...localObjective, priority: newPriority });
                    onUpdatePriority(newPriority);
                  }}
                  size="small"
                  variant="standard"
                  sx={{
                    'fontSize': '0.813rem',
                    'color': 'inherit',
                    '&:before': { borderBottom: 'none' },
                    '&:after': { borderBottom: 'none' },
                    '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                    '& .MuiSelect-select': {
                      py: 0,
                      px: 0,
                      textTransform: 'capitalize',
                    },
                    '& .MuiSelect-icon': {
                      display: 'none',
                    },
                  }}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              )}
              size="small"
              sx={{
                'border': 'none',
                'backgroundColor':
                  objective.priority === 'high'
                    ? 'error.100'
                    : objective.priority === 'low'
                      ? 'success.100'
                      : 'warning.100',
                'color':
                  objective.priority === 'high'
                    ? 'error.700'
                    : objective.priority === 'low'
                      ? 'success.700'
                      : 'warning.700',
                '& .MuiChip-icon': {
                  color:
                    objective.priority === 'high'
                      ? 'error.700'
                      : objective.priority === 'low'
                        ? 'success.700'
                        : 'warning.700',
                },
              }}
            />

            {/* Start Date Chip */}
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: '0.85rem' }} />}
              label={(
                <Box
                  component="label"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {objective.startDate
                    ? moment(objective.startDate).format('MMM D, YYYY')
                    : 'Start date'}
                  <TextField
                    type="date"
                    value={objective.startDate ? moment(objective.startDate).format('YYYY-MM-DD') : ''}
                    onChange={(e) => {
                      const newStartDate = e.target.value ? new Date(e.target.value) : null;
                      setLocalObjective({ ...localObjective, startDate: newStartDate });
                      onUpdateDates(newStartDate, objective.dueDate);
                    }}
                    size="small"
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      opacity: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              )}
              size="small"
              variant="outlined"
              sx={{
                'border': 'none',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />

            {/* Due Date Chip */}
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: '0.85rem' }} />}
              label={(
                <Box
                  component="label"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {objective.dueDate
                    ? moment(objective.dueDate).format('MMM D, YYYY')
                    : 'Due date'}
                  <TextField
                    type="date"
                    value={objective.dueDate ? moment(objective.dueDate).format('YYYY-MM-DD') : ''}
                    onChange={(e) => {
                      const newDueDate = e.target.value ? new Date(e.target.value) : null;
                      setLocalObjective({ ...localObjective, dueDate: newDueDate });
                      onUpdateDates(objective.startDate, newDueDate);
                    }}
                    size="small"
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      opacity: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              )}
              size="small"
              variant="outlined"
              sx={{
                'border': 'none',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </Box>

          {/* Description Section */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <TextField
              placeholder="Add description..."
              value={localObjective.description || ''}
              onChange={(e) => {
                const newDescription = e.target.value;
                setLocalObjective({ ...localObjective, description: newDescription });
              }}
              onBlur={() => onUpdateDescription(localObjective.description || '')}
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
                    const newStatus = task.status === 'done' ? 'todo' : 'done';
                    onUpdateTaskStatus(task.id, newStatus);
                  }}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: task.status === 'done' ? 'success.main' : 'grey.400',
                  }}
                >
                  {task.status === 'done'
                    ? <CheckBox fontSize="small" />
                    : <CheckBoxOutlineBlank fontSize="small" />}
                </Box>
                <TextField
                  inputRef={(el) => {
                    taskRefs[task.id] = el;
                  }}
                  value={task.name}
                  onChange={(e) => {
                    // This will be handled by parent
                  }}
                  onBlur={() => onUpdateTaskName(task.id, task.name)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      const input = taskRefs[task.id];
                      if (input) {
                        input.blur();
                      }
                    } else if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onUpdateTaskName(task.id, task.name);
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
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      color: task.status === 'done' ? 'grey.500' : 'inherit',
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
                  onClick={() => onDeleteTask(task.id)}
                />
              </Box>
            </Box>
          ))}

          {addingTask && (
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
                inputRef={newTaskRef}
                placeholder={t('task_name')}
                value={newTask.name}
                onChange={e =>
                  onNewTaskChange({
                    name: e.target.value,
                    description: newTask.description,
                  })}
                onBlur={() => {
                  onSetAddingTask(false);
                  onNewTaskChange({ name: '', description: '' });
                }}
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onTaskSubmit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onSetAddingTask(false);
                    onNewTaskChange({ name: '', description: '' });
                  } else if (e.key === 'Backspace' && target.value === '') {
                    e.preventDefault();
                    onSetAddingTask(false);
                    onNewTaskChange({ name: '', description: '' });
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
            onClick={() => onSetAddingTask(true)}
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
}

