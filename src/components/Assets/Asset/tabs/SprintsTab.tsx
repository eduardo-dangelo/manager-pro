'use client';

import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Box, Button, Chip, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Sprint = {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};

type Asset = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  sprints: Sprint[];
};

type SprintsTabProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

export function SprintsTab({ asset, locale, onUpdateAsset }: SprintsTabProps) {
  const t = useTranslations('Assets');
  const [newSprint, setNewSprint] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [addingSprint, setAddingSprint] = useState(false);

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
          assetId: asset.id,
          startDate: newSprint.startDate || null,
          endDate: newSprint.endDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create sprint');
      }

      const { sprint } = await response.json();
      onUpdateAsset({
        ...asset,
        sprints: [...asset.sprints, sprint],
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

      onUpdateAsset({
        ...asset,
        sprints: asset.sprints.filter(sprint => sprint.id !== sprintId),
      });
    } catch (error) {
      console.error('Error deleting sprint:', error);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, fontSize: '0.95rem' }}
        >
          {t('sprints_title')}
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setAddingSprint(!addingSprint)}
          sx={{
            'textTransform': 'none',
            'fontSize': '0.813rem',
            'color': 'grey.600',
            '&:hover': { backgroundColor: 'grey.100' },
          }}
        >
          {t('add_sprint')}
        </Button>
      </Box>

      {addingSprint && (
        <Box
          sx={{
            mb: 2,
            py: 1.5,
            px: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1,
          }}
        >
          <TextField
            placeholder={t('sprint_name')}
            value={newSprint.name}
            onChange={e =>
              setNewSprint({ ...newSprint, name: e.target.value })}
            fullWidth
            size="small"
            variant="standard"
            sx={{
              'mb': 1,
              '& .MuiInput-root:before': { borderBottomColor: 'grey.200' },
              '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                borderBottomColor: 'grey.300',
              },
            }}
          />
          <TextField
            placeholder={t('sprint_description')}
            value={newSprint.description}
            onChange={e =>
              setNewSprint({ ...newSprint, description: e.target.value })}
            fullWidth
            size="small"
            multiline
            rows={2}
            variant="standard"
            sx={{
              'mb': 1.5,
              '& .MuiInput-root:before': { borderBottomColor: 'grey.200' },
              '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                borderBottomColor: 'grey.300',
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <TextField
              placeholder={t('sprint_start_date')}
              type="date"
              value={newSprint.startDate}
              onChange={e =>
                setNewSprint({ ...newSprint, startDate: e.target.value })}
              fullWidth
              size="small"
              variant="standard"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInput-root:before': { borderBottomColor: 'grey.200' },
                '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                  borderBottomColor: 'grey.300',
                },
              }}
            />
            <TextField
              placeholder={t('sprint_end_date')}
              type="date"
              value={newSprint.endDate}
              onChange={e =>
                setNewSprint({ ...newSprint, endDate: e.target.value })}
              fullWidth
              size="small"
              variant="standard"
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInput-root:before': { borderBottomColor: 'grey.200' },
                '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                  borderBottomColor: 'grey.300',
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={addSprint}
              sx={{
                'textTransform': 'none',
                'fontSize': '0.813rem',
                'py': 0.5,
                'boxShadow': 'none',
                '&:hover': { boxShadow: 'none' },
              }}
            >
              {t('save')}
            </Button>
            <Button
              size="small"
              onClick={() => setAddingSprint(false)}
              sx={{
                textTransform: 'none',
                fontSize: '0.813rem',
                color: 'grey.600',
              }}
            >
              {t('cancel')}
            </Button>
          </Box>
        </Box>
      )}

      {asset.sprints.length === 0 && !addingSprint
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
              {t('no_sprints')}
            </Typography>
          )
        : (
            asset.sprints.map(sprint => (
              <Box
                key={sprint.id}
                sx={{
                  'py': 1.5,
                  'px': 2,
                  'borderBottom': '1px solid',
                  'borderColor': 'grey.200',
                  'display': 'flex',
                  'justifyContent': 'space-between',
                  'alignItems': 'center',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { backgroundColor: 'grey.50' },
                }}
              >
                <Box
                  sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.938rem',
                      minWidth: '200px',
                      flexShrink: 0,
                    }}
                  >
                    {sprint.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'grey.600', fontSize: '0.813rem', flex: 1 }}
                  >
                    {sprint.description}
                  </Typography>
                  {sprint.startDate && sprint.endDate && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'grey.500',
                        fontSize: '0.75rem',
                        flexShrink: 0,
                      }}
                    >
                      {new Date(sprint.startDate).toLocaleDateString()}
                      {' - '}
                      {new Date(sprint.endDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}
                >
                  <Chip
                    label={sprint.status}
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
                    onClick={() => deleteSprint(sprint.id)}
                  />
                </Box>
              </Box>
            ))
          )}
    </Box>
  );
}
