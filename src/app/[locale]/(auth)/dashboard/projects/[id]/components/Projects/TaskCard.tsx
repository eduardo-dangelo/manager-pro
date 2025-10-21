'use client';

import { CheckBox, CheckBoxOutlineBlank, Delete as DeleteIcon } from '@mui/icons-material';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { useState } from 'react';

type Task = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  objectiveId: number | null;
};

type TaskCardProps = {
  task: Task;
  onStatusChange: (taskId: number, status: string) => void;
  onDelete: (taskId: number) => void;
  onDragStart: (e: React.DragEvent, taskId: number) => void;
};

export function TaskCard({ task, onStatusChange, onDelete, onDragStart }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

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

  const priorityColors = getPriorityColor(task.priority);

  return (
    <Paper
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, task.id);
      }}
      onDragEnd={() => setIsDragging(false)}
      sx={{
        'p': 1.5,
        'mb': 1,
        'cursor': 'grab',
        'opacity': isDragging ? 0.5 : 1,
        'transition': 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          '& .delete-icon': {
            opacity: 1,
          },
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
      elevation={1}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            const newStatus = task.status === 'done' ? 'todo' : 'done';
            onStatusChange(task.id, newStatus);
          }}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: task.status === 'done' ? 'success.main' : 'grey.400',
            flexShrink: 0,
          }}
        >
          {task.status === 'done'
            ? <CheckBox fontSize="small" />
            : <CheckBoxOutlineBlank fontSize="small" />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              mb: 0.5,
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
              color: task.status === 'done' ? 'grey.500' : 'grey.900',
              wordBreak: 'break-word',
            }}
          >
            {task.name}
          </Typography>
          {task.description && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'grey.600',
                fontSize: '0.75rem',
                mb: 1,
                wordBreak: 'break-word',
              }}
            >
              {task.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip
              label={task.priority}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.688rem',
                backgroundColor: priorityColors.bg,
                color: priorityColors.color,
                textTransform: 'capitalize',
              }}
            />
            <DeleteIcon
              className="delete-icon"
              fontSize="small"
              sx={{
                'cursor': 'pointer',
                'color': 'grey.400',
                'opacity': 0,
                'transition': 'opacity 0.2s, color 0.2s',
                '&:hover': { color: 'error.main' },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

