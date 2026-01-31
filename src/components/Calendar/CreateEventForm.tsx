'use client';

import type { CalendarEvent } from './types';
import { Palette as PaletteIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_EVENT_COLOR, EVENT_COLORS } from './constants';

function isCustomColor(color: string): boolean {
  return color?.startsWith('#') ?? false;
}

export type AssetOption = { id: number; name: string | null };

export function toDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateTime(dateStr: string, timeStr: string): Date {
  const [hh, mm] = timeStr.split(':').map(Number);
  const d = new Date(dateStr);
  d.setHours(hh, mm, 0, 0);
  return d;
}

type CreateEventFormProps = {
  open: boolean;
  initialDate?: Date;
  assetId?: number;
  assets?: AssetOption[];
  locale: string;
  onSuccess: (event: CalendarEvent) => void;
  onCancel: () => void;
  variant?: 'modal' | 'popover';
};

export function CreateEventForm({
  open,
  initialDate,
  assetId: fixedAssetId,
  assets,
  locale,
  onSuccess,
  onCancel,
  variant = 'modal',
}: CreateEventFormProps) {
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
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isGlobal = !fixedAssetId && (assets?.length ?? 0) > 0;
  const effectiveAssetId = fixedAssetId ?? (typeof selectedAssetId === 'number' ? selectedAssetId : null);

  /* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect -- reset form when opened */
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
      onSuccess(event);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onCancel();
    }
  };

  const isPopover = variant === 'popover';
  const contentGap = isPopover ? 1.5 : 2;
  const descriptionRows = isPopover ? 2 : 3;

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ p: isPopover ? 2 : 0, display: 'flex', flexDirection: 'column', gap: contentGap }}>
        {isPopover && (
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            {t('new_event')}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: contentGap }}>
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
            label={t('event_name_label')}
            value={name}
            onChange={e => setName(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Box
                      component="button"
                      type="button"
                      onClick={e => setColorPickerAnchor(e.currentTarget)}
                      aria-label={t('event_color')}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: EVENT_COLORS.find(c => c.value === color)?.hex ?? color,
                        cursor: 'pointer',
                        p: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 2px',
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Popover
            open={Boolean(colorPickerAnchor)}
            anchorEl={colorPickerAnchor}
            onClose={() => setColorPickerAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ position: 'relative', p: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 24px)',
                  gap: 1,
                }}
              >
                {EVENT_COLORS.map(c => (
                  <Box
                    key={c.value}
                    component="button"
                    type="button"
                    onClick={() => {
                      setColor(c.value);
                      setColorPickerAnchor(null);
                    }}
                    aria-label={c.label}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: c.hex,
                      border: color === c.value ? '2px solid' : '2px solid transparent',
                      borderColor: color === c.value ? 'primary.main' : 'transparent',
                      cursor: 'pointer',
                      p: 0,
                    }}
                  />
                ))}
                <Box
                  component="button"
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  aria-label={t('event_color_custom')}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: isCustomColor(color) ? color : 'grey.300',
                    border: isCustomColor(color) ? '2px solid' : '2px solid transparent',
                    borderColor: isCustomColor(color) ? 'primary.main' : 'transparent',
                    cursor: 'pointer',
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!isCustomColor(color) && (
                    <PaletteIcon sx={{ fontSize: 14, color: 'grey.600' }} />
                  )}
                </Box>
              </Box>
              <input
                ref={colorInputRef}
                type="color"
                value={isCustomColor(color) ? color : '#3b82f6'}
                onChange={(e) => {
                  setColor(e.target.value);
                  setColorPickerAnchor(null);
                }}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: 0,
                  height: 0,
                  pointerEvents: 'none',
                }}
                aria-hidden
              />
            </Box>
          </Popover>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              required
              size="small"
              label={t('event_date')}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: '2 1 0', minWidth: 0 }}
            />
            <TextField
              size="small"
              label={t('event_start_time')}
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              slotProps={{
                input: {
                  sx: {
                    '& input::-webkit-calendar-picker-indicator': { display: 'none' },
                  },
                },
              }}
              sx={{ flex: '1 1 0', minWidth: 0 }}
            />
            <TextField
              size="small"
              label={t('event_end_time')}
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              slotProps={{
                input: {
                  sx: {
                    '& input::-webkit-calendar-picker-indicator': { display: 'none' },
                  },
                },
              }}
              sx={{ flex: '1 1 0', minWidth: 0 }}
            />
          </Box>
          {/* <TextField
            fullWidth
            size="small"
            label={t('event_location')}
            value={location}
            onChange={e => setLocation(e.target.value)}
          /> */}
          <TextField
            fullWidth
            size="small"
            label={t('event_description')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            multiline
            rows={descriptionRows}
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: isPopover ? 0 : 1 }}>
          <Button type="button" onClick={handleCancel} disabled={loading} size="small">
            {tAssets('cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={loading} size="small">
            {tAssets('save')}
          </Button>
        </Box>
      </Box>
    </form>
  );
}
