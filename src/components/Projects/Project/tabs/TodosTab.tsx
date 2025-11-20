'use client';

import {
  CheckBox,
  CheckBoxOutlineBlank,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
};

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  todos: Todo[];
  objectives: Objective[];
};

type TodosTabProps = {
  project: Project;
  locale: string;
  onUpdateProject: (project: Project) => void;
};

export function TodosTab({ project, locale, onUpdateProject }: TodosTabProps) {
  const t = useTranslations('Projects');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const updateTodoStatus = async (todoId: number, newStatus: string) => {
    try {
      const response = await fetch(`/${locale}/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      onUpdateProject({
        ...project,
        todos: project.todos.map(todo =>
          todo.id === todoId ? { ...todo, status: newStatus } : todo,
        ),
      });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const updateTodoPriority = async (todoId: number, newPriority: string) => {
    try {
      const response = await fetch(`/${locale}/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      onUpdateProject({
        ...project,
        todos: project.todos.map(todo =>
          todo.id === todoId ? { ...todo, priority: newPriority } : todo,
        ),
      });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const updateTodoName = async (todoId: number, name: string) => {
    try {
      const response = await fetch(`/${locale}/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      onUpdateProject({
        ...project,
        todos: project.todos.map(todo =>
          todo.id === todoId ? { ...todo, name } : todo,
        ),
      });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (todoId: number) => {
    try {
      const response = await fetch(`/${locale}/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      onUpdateProject({
        ...project,
        todos: project.todos.filter(todo => todo.id !== todoId),
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const getObjectiveName = (objectiveId: number | null) => {
    if (!objectiveId) {
      return '-';
    }
    const objective = project.objectives.find(obj => obj.id === objectiveId);
    return objective ? objective.name : '-';
  };

  const getFilteredTodos = () => {
    return project.todos.filter((todo) => {
      const statusMatch = filterStatus === 'all' || todo.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || todo.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
  };

  const filteredTodos = getFilteredTodos();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return { bg: 'success.100', color: 'success.700' };
      case 'in-progress':
        return { bg: 'primary.100', color: 'primary.700' };
      case 'todo':
        return { bg: 'grey.100', color: 'grey.700' };
      default:
        return { bg: 'grey.100', color: 'grey.700' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return { bg: 'error.100', color: 'error.700' };
      case 'medium':
        return { bg: 'warning.100', color: 'warning.700' };
      case 'low':
        return { bg: 'success.100', color: 'success.700' };
      default:
        return { bg: 'grey.100', color: 'grey.700' };
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {t('todos_title')}
          {' '}
          <Chip
            label={filteredTodos.length}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.813rem',
              ml: 1,
            }}
          />
        </Typography>
        <IconButton
          size="small"
          onClick={handleFilterClick}
          sx={{
            'color': filterStatus !== 'all' || filterPriority !== 'all' ? 'primary.main' : 'grey.600',
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
        >
          <FilterIcon />
        </IconButton>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'grey.600' }}>
              Status
            </Typography>
            <Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                handleFilterClose();
              }}
              size="small"
              fullWidth
              sx={{ mt: 0.5, mb: 2 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="todo">{t('status_todo')}</MenuItem>
              <MenuItem value="in-progress">{t('status_in_progress')}</MenuItem>
              <MenuItem value="done">{t('status_done')}</MenuItem>
            </Select>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'grey.600' }}>
              Priority
            </Typography>
            <Select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                handleFilterClose();
              }}
              size="small"
              fullWidth
              sx={{ mt: 0.5 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="low">{t('priority_low')}</MenuItem>
              <MenuItem value="medium">{t('priority_medium')}</MenuItem>
              <MenuItem value="high">{t('priority_high')}</MenuItem>
            </Select>
          </Box>
        </Menu>
      </Box>

      {filteredTodos.length === 0
        ? (
            <Paper
              sx={{
                p: 5,
                textAlign: 'center',
              }}
              elevation={0}
            >
              <Typography
                variant="body1"
                sx={{ color: 'grey.400', fontSize: '0.938rem' }}
              >
                {t('no_todos')}
              </Typography>
            </Paper>
          )
        : (
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 40 }} />
                    <TableCell sx={{ fontWeight: 600 }}>{t('todo_name')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 180 }}>Objective</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 140 }}>{t('todo_status')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 120 }}>{t('todo_priority')}</TableCell>
                    <TableCell sx={{ width: 60 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTodos.map((todo) => {
                    const statusColors = getStatusColor(todo.status);
                    const priorityColors = getPriorityColor(todo.priority);

                    return (
                      <TableRow
                        key={todo.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'grey.50',
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            onClick={() => {
                              const newStatus = todo.status === 'done' ? 'todo' : 'done';
                              updateTodoStatus(todo.id, newStatus);
                            }}
                            sx={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: todo.status === 'done' ? 'success.main' : 'grey.400',
                            }}
                          >
                            {todo.status === 'done'
                              ? <CheckBox fontSize="small" />
                              : <CheckBoxOutlineBlank fontSize="small" />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={todo.name}
                            onChange={(e) => {
                              onUpdateProject({
                                ...project,
                                todos: project.todos.map(t =>
                                  t.id === todo.id ? { ...t, name: e.target.value } : t,
                                ),
                              });
                            }}
                            onBlur={() => updateTodoName(todo.id, todo.name)}
                            variant="standard"
                            fullWidth
                            sx={{
                              '& .MuiInput-root': {
                                'fontSize': '0.875rem',
                                '&:before': { borderBottom: 'none' },
                                '&:after': { borderBottom: 'none' },
                                '&:hover:not(.Mui-disabled):before': {
                                  borderBottom: 'none',
                                },
                              },
                              '& input': {
                                textDecoration: todo.status === 'done' ? 'line-through' : 'none',
                                color: todo.status === 'done' ? 'grey.500' : 'inherit',
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.875rem',
                              color: 'grey.600',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getObjectiveName(todo.objectiveId)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={todo.status}
                            onChange={e => updateTodoStatus(todo.id, e.target.value)}
                            size="small"
                            variant="standard"
                            sx={{
                              'fontSize': '0.813rem',
                              'width': '100%',
                              '&:before': { borderBottom: 'none' },
                              '&:after': { borderBottom: 'none' },
                              '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                              '& .MuiSelect-select': {
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                backgroundColor: statusColors.bg,
                                color: statusColors.color,
                                fontWeight: 500,
                              },
                            }}
                          >
                            <MenuItem value="todo">{t('status_todo')}</MenuItem>
                            <MenuItem value="in-progress">{t('status_in_progress')}</MenuItem>
                            <MenuItem value="done">{t('status_done')}</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={todo.priority}
                            onChange={e => updateTodoPriority(todo.id, e.target.value)}
                            size="small"
                            variant="standard"
                            sx={{
                              'fontSize': '0.813rem',
                              'width': '100%',
                              '&:before': { borderBottom: 'none' },
                              '&:after': { borderBottom: 'none' },
                              '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                              '& .MuiSelect-select': {
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                backgroundColor: priorityColors.bg,
                                color: priorityColors.color,
                                fontWeight: 500,
                                textTransform: 'capitalize',
                              },
                            }}
                          >
                            <MenuItem value="low">{t('priority_low')}</MenuItem>
                            <MenuItem value="medium">{t('priority_medium')}</MenuItem>
                            <MenuItem value="high">{t('priority_high')}</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => deleteTodo(todo.id)}
                            sx={{
                              'color': 'grey.400',
                              '&:hover': {
                                color: 'error.main',
                                backgroundColor: 'error.50',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
    </Box>
  );
}
