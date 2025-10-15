'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const colors = [
  { value: 'gray', label: 'Gray' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
];

const colorMap: Record<string, string> = {
  gray: '#6b7280',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
};

type ProjectFormProps = {
  locale: string;
  project?: {
    id: number;
    name: string;
    description: string;
    color: string;
    status: string;
  };
};

export function ProjectForm({ locale, project }: ProjectFormProps) {
  const t = useTranslations('Projects');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || 'blue',
    status: project?.status || 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = project
        ? `/${locale}/api/projects/${project.id}`
        : `/${locale}/api/projects`;

      const method = project ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error || 'Failed to save project');
      }

      const data = await response.json();

      // Redirect to project detail page
      router.push(`/${locale}/dashboard/projects/${data.project.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        border: 1,
        borderColor: 'grey.200',
        borderRadius: 2,
        maxWidth: 800,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name */}
            <TextField
              label={t('project_name')}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />

            {/* Description */}
            <TextField
              label={t('project_description')}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />

            {/* Color */}
            <FormControl fullWidth>
              <InputLabel>{t('project_color')}</InputLabel>
              <Select
                value={formData.color}
                label={t('project_color')}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
              >
                {colors.map(color => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: colorMap[color.value],
                        }}
                      />
                      <Typography>{color.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>{t('project_status')}</InputLabel>
              <Select
                value={formData.status}
                label={t('project_status')}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">{t('status_active')}</MenuItem>
                <MenuItem value="completed">{t('status_completed')}</MenuItem>
                <MenuItem value="archived">{t('status_archived')}</MenuItem>
                <MenuItem value="on-hold">{t('status_on_hold')}</MenuItem>
              </Select>
            </FormControl>

            {/* Error Message */}
            {error && (
              <FormHelperText error sx={{ fontSize: '0.875rem' }}>
                {error}
              </FormHelperText>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  px: 3,
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  'bgcolor': '#1e293b',
                  'color': 'white',
                  'textTransform': 'none',
                  'px': 3,
                  '&:hover': {
                    bgcolor: '#0f172a',
                  },
                }}
              >
                {loading ? 'Saving...' : t('save')}
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
