'use client';

import { Box, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
};

type ProjectHeaderProps = {
  project: Project;
  locale: string;
  onUpdate: (updates: Partial<Project>) => Promise<void>;
};

export function ProjectHeader({
  project,
  locale,
  onUpdate,
}: ProjectHeaderProps) {
  const t = useTranslations('Projects');
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [localProject, setLocalProject] = useState(project);
  const [saving, setSaving] = useState(false);

  const handleSave = async (updates: Partial<Project>) => {
    setSaving(true);
    await onUpdate(updates);
    setSaving(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && descriptionRef.current) {
      e.preventDefault();
      descriptionRef.current.focus();
    }
  };

  return (
    <>
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
          value={localProject.name}
          onChange={e => setLocalProject({ ...localProject, name: e.target.value })}
          onBlur={() => handleSave({ name: localProject.name })}
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
            value={localProject.status}
            onChange={(e) => {
              const newStatus = e.target.value;
              setLocalProject({ ...localProject, status: newStatus });
              handleSave({ status: newStatus });
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
                  localProject.status === 'active'
                    ? 'primary.50'
                    : localProject.status === 'completed'
                      ? 'success.50'
                      : localProject.status === 'archived'
                        ? 'grey.100'
                        : 'warning.50',
                'color':
                  localProject.status === 'active'
                    ? 'primary.700'
                    : localProject.status === 'completed'
                      ? 'success.700'
                      : localProject.status === 'archived'
                        ? 'grey.700'
                        : 'warning.700',
                'fontWeight': 500,
                '&:hover': {
                  backgroundColor:
                    localProject.status === 'active'
                      ? 'primary.100'
                      : localProject.status === 'completed'
                        ? 'success.100'
                        : localProject.status === 'archived'
                          ? 'grey.200'
                          : 'warning.100',
                },
              },
              '& .MuiSelect-icon': {
                color:
                  localProject.status === 'active'
                    ? 'primary.700'
                    : localProject.status === 'completed'
                      ? 'success.700'
                      : localProject.status === 'archived'
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
      {/* <TextField
        inputRef={descriptionRef}
        value={localProject.description}
        onChange={e =>
          setLocalProject({ ...localProject, description: e.target.value })}
        onBlur={() => handleSave({ description: localProject.description })}
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
      /> */}
    </>
  );
}
