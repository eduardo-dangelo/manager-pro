'use client';

import { Box, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useHoverSound } from '@/hooks/useHoverSound';

export function SettingsContent() {
  const t = useTranslations('Settings');
  const { hoverSoundEnabled, updatePreference, isLoading } = useHoverSound();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsUpdating(true);
    try {
      await updatePreference(newValue);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'text.primary',
          mb: 1,
        }}
      >
        {t('page_title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        {t('page_description')}
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
          }}
        >
          {t('sound_settings_title', { defaultValue: 'Sound Settings' })}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 3,
            fontSize: '0.875rem',
          }}
        >
          {t('hover_sound_description', {
            defaultValue: 'Play a subtle sound when hovering over buttons and links',
          })}
        </Typography>
        <FormControlLabel
          control={(
            <Switch
              checked={hoverSoundEnabled}
              onChange={handleToggle}
              disabled={isLoading || isUpdating}
            />
          )}
          label={t('hover_sound_label', { defaultValue: 'Hover Sound' })}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
              fontWeight: 500,
            },
          }}
        />
      </Paper>
    </Box>
  );
}
