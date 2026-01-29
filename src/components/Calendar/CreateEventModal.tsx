'use client';

import type { CalendarEvent } from './types';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { DEFAULT_EVENT_COLOR, EVENT_COLORS } from './constants';

type AssetOption = { id: number; name: string | null };

type CreateEventModalProps = {
  open: boolean;
  onClose: () => void;
  initialDate?: Date;
  assetId?: number;
  assets?: AssetOption[];
  locale: string;
  onCreateSuccess?: (event: CalendarEvent) => void;
};

function toDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [hh, mm] = timeStr.split(':').map(Number);
  const d = new Date(dateStr);
  d.setHours(hh, mm, 0, 0);
  return d;
}

export function CreateEventModal({
  open,
  onClose,
  initialDate,
  assetId: fixedAssetId,
  assets,
  locale,
  onCreateSuccess,
}: CreateEventModalProps) {
  const t = useTranslations('Calendar');
  const tAssets = useTranslations('Assets');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(DEFAULT_EVENT_COLOR);
  const [description, setDescription] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | ''>('');

  const isGlobal = !fixedAssetId && (assets?.length ?? 0) > 0;
  const effectiveAssetId = fixedAssetId ?? (typeof selectedAssetId === 'number' ? selectedAssetId : null);

  /* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect -- reset form when modal opens */
  useEffect(() => {
    if (!open) {
      return;
    }
    const d = initialDate ?? new Date();
    setDate(toDateLocal(d));
    setStartTime('09:00');
    setEndTime('10:00');
    setName('');
    setLocation('');
    setColor(DEFAULT_EVENT_COLOR);
    setDescription('');
    setError(null);
    if (isGlobal && assets?.length) {
      setSelectedAssetId(assets[0].id);
    } else {
      setSelectedAssetId('');
    }
  }, [open, initialDate, isGlobal, assets]);
  /* eslint-enable react-hooks-extra/no-direct-set-state-in-use-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveAssetId) {
      setError(isGlobal ? t('select_asset') : 'Asset is required');
      return;
    }
    if (!name.trim()) {
      setError('Event name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const start = parseDateTime(date, startTime);
      const end = parseDateTime(date, endTime);
      if (end <= start) {
        setError('End time must be after start time');
        setLoading(false);
        return;
      }
      const res = await fetch(`/${locale}/api/calendar-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: effectiveAssetId,
          name: name.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          color: color || null,
          start: start.toISOString(),
          end: end.toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to create event');
      }
      const { event } = (await res.json()) as { event: CalendarEvent };
      onCreateSuccess?.(event);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {t('create_event')}
          </Typography>
          <IconButton
            edge="end"
            onClick={handleClose}
            disabled={loading}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {isGlobal && assets && assets.length > 0 && (
              <FormControl fullWidth required size="small">
                <InputLabel>{t('event_asset')}</InputLabel>
                <Select
                  value={selectedAssetId}
                  label={t('event_asset')}
                  onChange={e => setSelectedAssetId(e.target.value as number)}
                >
                  {assets.map(a => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name ?? `Asset ${a.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              fullWidth
              required
              size="small"
              label={t('event_name')}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                required
                size="small"
                label={t('event_date')}
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: '1 1 140px' }}
              />
              <TextField
                size="small"
                label={t('event_start_time')}
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{ flex: '1 1 100px' }}
              />
              <TextField
                size="small"
                label={t('event_end_time')}
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{ flex: '1 1 100px' }}
              />
            </Box>
            <TextField
              fullWidth
              size="small"
              label={t('event_location')}
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <FormControl fullWidth size="small">
              <InputLabel>{t('event_color')}</InputLabel>
              <Select
                value={color}
                label={t('event_color')}
                onChange={e => setColor(e.target.value)}
                renderValue={v => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 0.5,
                        bgcolor: EVENT_COLORS.find(c => c.value === v)?.hex ?? v,
                      }}
                    />
                    {EVENT_COLORS.find(c => c.value === v)?.label ?? v}
                  </Box>
                )}
              >
                {EVENT_COLORS.map(c => (
                  <MenuItem key={c.value} value={c.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 0.5,
                          bgcolor: c.hex,
                        }}
                      />
                      {c.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label={t('event_description')}
              value={description}
              onChange={e => setDescription(e.target.value)}
              multiline
              rows={3}
            />
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            {tAssets('cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {tAssets('save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
