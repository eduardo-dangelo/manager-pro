'use client';

import {
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Fade,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

type SpecItem = {
  key: string;
  label: string;
  value: any;
  format: (v: any) => string | null;
};

type VehicleSpecItemProps = {
  item: SpecItem;
  icon: React.ReactNode;
  onSave: (key: string, rawValue: string | number) => Promise<void>;
  playHoverSound?: () => void;
};

// Helper function to parse edited values based on item type
const parseValue = (key: string, value: string): string | number => {
  const trimmed = value.trim();

  // Mileage and yearly mileage: Remove " mi" suffix and commas, convert to number
  if (key === 'mileage' || key === 'yearMileage') {
    const cleaned = trimmed.replace(/\s*mi\s*/gi, '').replace(/,/g, '');
    const num = Number.parseFloat(cleaned);
    return Number.isNaN(num) ? trimmed : num;
  }

  // Engine size: Handle "cc" and "L" suffixes
  if (key === 'engineSize') {
    const lowerTrimmed = trimmed.toLowerCase();
    if (lowerTrimmed.endsWith('cc')) {
      const num = Number.parseFloat(lowerTrimmed.replace('cc', '').trim());
      return Number.isNaN(num) ? trimmed : num;
    }
    if (lowerTrimmed.endsWith('l')) {
      const num = Number.parseFloat(lowerTrimmed.replace('l', '').trim());
      return Number.isNaN(num) ? trimmed : num * 1000; // Convert to cc for storage
    }
    // If it's a number, check if it's cc or liters
    const num = Number.parseFloat(trimmed);
    if (!Number.isNaN(num)) {
      // If > 950, assume it's cc; otherwise could be liters
      return num < 950 ? num : num;
    }
    return trimmed;
  }

  // Age: Remove " yrs" suffix, convert to number
  if (key === 'age') {
    const cleaned = trimmed.replace(/\s*yrs?\s*/gi, '');
    const num = Number.parseFloat(cleaned);
    return Number.isNaN(num) ? trimmed : num;
  }

  // Other fields: Trim whitespace, keep as string
  return trimmed;
};

export function VehicleSpecItem({ item, icon, onSave, playHoverSound }: VehicleSpecItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formattedValue = item.format(item.value);

  // Auto-focus and select all when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle hover delay with cleanup
  useEffect(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Hide actions immediately if not hovering or editing
    if (!isHovered || isEditing) {
      setShowActions(false);
      return undefined;
    }

    // Start timeout to show actions after 500ms
    const timeoutId = setTimeout(() => {
      setShowActions(true);
    }, 500);
    hoverTimeoutRef.current = timeoutId;

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isHovered, isEditing]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) {
      return;
    }
    const formatted = formattedValue || '';
    setEditValue(formatted);
    setIsEditing(true);
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    if (!editValue.trim()) {
      handleCancel();
      return;
    }

    setIsSaving(true);
    try {
      const parsedValue = parseValue(item.key, editValue);
      await onSave(item.key, parsedValue);
      setIsEditing(false);
      setEditValue('');
    } catch (error) {
      console.error('Error saving spec item:', error);
      // On error, revert to formatted value but stay in edit mode so user can try again
      setEditValue(formattedValue || '');
      // Stay in edit mode so user can correct and retry
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!formattedValue) {
      return;
    }
    try {
      await navigator.clipboard.writeText(formattedValue);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleMouseEnter = () => {
    if (!isEditing && !isSaving) {
      setIsHovered(true);
      if (playHoverSound) {
        playHoverSound();
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isEditing) {
      setIsHovered(false);
    }
  };

  return (
    <Box sx={{ width: { xs: '100%', sm: '50%' }, py: 0.5 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 130, flex: 1, maxWidth: '210px' }}>
          {icon}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {item.label}
            :
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 240,
            flex: 1,
            position: 'relative',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={!isEditing ? () => handleCopy({ stopPropagation: () => {} } as React.MouseEvent) : undefined}
        >
          {isEditing
            ? (
                <TextField
                  inputRef={inputRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  disabled={isSaving}
                  variant="standard"
                  sx={{
                    'flex': 1,
                    '& .MuiInputBase-root': {
                      'border': 'none',
                      'backgroundColor': 'transparent',
                      'padding': 0,
                      '&:before': {
                        borderBottom: 'none',
                      },
                      '&:after': {
                        borderBottom: 'none',
                      },
                      '&:hover:not(.Mui-disabled):before': {
                        borderBottom: 'none',
                      },
                      '&.Mui-focused:before': {
                        borderBottom: 'none',
                      },
                      '&.Mui-focused:after': {
                        borderBottom: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: 0,
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      cursor: 'text',
                    },
                  }}
                />
              )
            : (
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, cursor: 'pointer' }}>
                  {formattedValue || '-'}
                </Typography>
              )}
          {isHovered && !isEditing && formattedValue && (
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Box
                sx={{
                  width: showActions && !isEditing && formattedValue ? 20 : 0,
                  overflow: 'hidden',
                  transition: 'width 200ms ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Fade in={showActions && !isEditing && !!formattedValue} timeout={200} mountOnEnter unmountOnExit>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={handleEditClick}
                      sx={{
                        'padding': 0.25,
                        'minWidth': 'auto',
                        'width': 20,
                        'height': 20,
                        'color': 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Fade>
              </Box>
              <Tooltip title="Copy">
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    'padding': 0.25,
                    'minWidth': 'auto',
                    'width': 20,
                    'height': 20,
                    'color': 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Fade in={copied} mountOnEnter unmountOnExit>
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    left: 48,
                    whiteSpace: 'nowrap',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  Copied
                </Typography>
              </Fade>
            </Box>
          )}
          {isSaving && (
            <Box sx={{ ml: 1 }}>
              <CircularProgress size={14} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
