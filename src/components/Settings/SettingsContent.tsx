'use client';

import { Box, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Switch, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useHoverSound } from '@/hooks/useHoverSound';
import { useGetUserPreferences, useUpdateUserPreferences } from '@/queries/hooks/users';

export function SettingsContent() {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const { hoverSoundEnabled, updatePreference, isLoading } = useHoverSound();
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: preferences } = useGetUserPreferences(locale);
  const updateUserPreferences = useUpdateUserPreferences(locale);

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
        <Box sx={{ mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="settings-currency-label">Currency</InputLabel>
            <Select
              labelId="settings-currency-label"
              label="Currency"
              value={preferences?.currency ?? 'GBP'}
              onChange={(event) => {
                void updateUserPreferences.mutateAsync({ currency: String(event.target.value) });
              }}
              disabled={updateUserPreferences.isPending}
            >
              <MenuItem value="GBP">GBP (£)</MenuItem>
              <MenuItem value="EUR">EUR (€)</MenuItem>
              <MenuItem value="USD">USD ($)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
    </Box>
  );
}
