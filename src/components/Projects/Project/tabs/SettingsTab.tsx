'use client';

import { Delete as DeleteIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

type SettingsTabProps = {
  projectId: number;
  projectName: string;
  locale: string;
};

export function SettingsTab({ projectId, projectName, locale }: SettingsTabProps) {
  const t = useTranslations('Projects');
  const router = useRouter();

  const deleteProject = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('delete_confirm'))) {
      return;
    }

    try {
      const response = await fetch(`/${locale}/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      router.push(`/${locale}/projects`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Typography
        variant="body1"
        sx={{ fontWeight: 600, mb: 2, fontSize: '0.95rem' }}
      >
        {t('settings_title')}
      </Typography>
      <Box
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'error.light',
          borderRadius: 2,
          backgroundColor: 'error.50',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, mb: 1, color: 'error.dark' }}
        >
          Danger Zone
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'grey.700', mb: 2, fontSize: '0.875rem' }}
        >
          Once you delete a project, there is no going back. Please be certain.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon fontSize="small" />}
          onClick={deleteProject}
          sx={{
            'textTransform': 'none',
            'fontSize': '0.813rem',
            'borderColor': 'error.main',
            'color': 'error.main',
            '&:hover': {
              borderColor: 'error.dark',
              backgroundColor: 'error.100',
            },
          }}
        >
          {t('delete_project')}
        </Button>
      </Box>
    </Box>
  );
}

