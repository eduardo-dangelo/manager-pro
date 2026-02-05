'use client';

import type { CalendarEvent } from './types';
import { Close as CloseIcon, Palette as PaletteIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { endOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_EVENT_COLOR, EVENT_COLORS } from './constants';
import { TimePickerPopover } from './TimePickerPopover';

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
  const parts = timeStr.split(':').map(Number);
  const hh = parts[0] ?? 0;
  const mm = parts[1] ?? 0;
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
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(DEFAULT_EVENT_COLOR);
  const [description, setDescription] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | ''>('');
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [startTimeAnchor, setStartTimeAnchor] = useState<HTMLElement | null>(null);
  const [endTimeAnchor, setEndTimeAnchor] = useState<HTMLElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isGlobal = !fixedAssetId && (assets?.length ?? 0) > 0;
  const effectiveAssetId = fixedAssetId ?? (typeof selectedAssetId === 'number' ? selectedAssetId : null);

  /* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect -- reset form when opened */
  useEffect(() => {
    if (!open) {
      return;
    }
    const d = initialDate ?? new Date();
    const dateStr = toDateLocal(d);
    setDate(dateStr);
    setEndDate(dateStr);
    setStartTime('09:00');
    setEndTime('10:00');
    setAllDay(false);
    setName('');
    setLocation('');
    setColor(DEFAULT_EVENT_COLOR);
    setDescription('');
    setError(null);
    if (isGlobal && assets?.length) {
      setSelectedAssetId(assets[0]!.id);
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
      let start: Date;
      let end: Date;
      if (allDay) {
        start = parseDateTime(date, '00:00');
        end = endOfDay(parseDateTime(endDate, '00:00'));
        if (end < start) {
          setError('End date must be on or after start date');
          setLoading(false);
          return;
        }
      } else {
        start = parseDateTime(date, startTime);
        end = parseDateTime(date, endTime);
        if (end <= start) {
          setError('End time must be after start time');
          setLoading(false);
          return;
        }
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {t('new_event')}
            </Typography>
            <IconButton
              edge="end"
              onClick={handleCancel}
              aria-label="Close"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: contentGap }}>
          {isGlobal && assets && assets.length > 0 && (
            <FormControl fullWidth required size="small">
              <InputLabel sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}>
                {t('event_asset')}
              </InputLabel>
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
              inputLabel: {
                sx: { '& .MuiFormLabel-asterisk': { color: 'error.main' } },
              },
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: contentGap }}>
            {allDay
              ? (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      required
                      size="small"
                      label={t('event_date')}
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                          sx: { '& .MuiFormLabel-asterisk': { color: 'error.main' } },
                        },
                      }}
                      sx={{ flex: '1 1 0', minWidth: 0 }}
                    />
                    <TextField
                      required
                      size="small"
                      label={t('event_end_date')}
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                          sx: { '& .MuiFormLabel-asterisk': { color: 'error.main' } },
                        },
                      }}
                      sx={{ flex: '1 1 0', minWidth: 0 }}
                    />
                  </Box>
                )
              : (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                      required
                      size="small"
                      label={t('event_date')}
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                          sx: { '& .MuiFormLabel-asterisk': { color: 'error.main' } },
                        },
                      }}
                      sx={{ flex: '2 1 0', minWidth: 0 }}
                    />
                    <Box
                      onClick={e => setStartTimeAnchor(e.currentTarget)}
                      sx={{ flex: '1 1 0', minWidth: 0, cursor: 'pointer' }}
                    >
                      <TextField
                        size="small"
                        label={t('event_start_time')}
                        value={startTime}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: true,
                            sx: { 'cursor': 'pointer', '&::-webkit-calendar-picker-indicator': { display: 'none' } },
                          },
                        }}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                    <Box
                      onClick={e => setEndTimeAnchor(e.currentTarget)}
                      sx={{ flex: '1 1 0', minWidth: 0, cursor: 'pointer' }}
                    >
                      <TextField
                        size="small"
                        label={t('event_end_time')}
                        value={endTime}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            readOnly: true,
                            sx: { 'cursor': 'pointer', '&::-webkit-calendar-picker-indicator': { display: 'none' } },
                          },
                        }}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  </Box>
                )}
            <FormControlLabel
              control={(
                <Checkbox
                  checked={allDay}
                  onChange={e => setAllDay(e.target.checked)}
                  size="small"
                  sx={{ my: -1 }}
                />
              )}
              label={t('all_day')}
            />
            <TimePickerPopover
              open={Boolean(startTimeAnchor)}
              anchorEl={startTimeAnchor}
              onClose={() => setStartTimeAnchor(null)}
              value={startTime}
              onChange={setStartTime}
            />
            <TimePickerPopover
              open={Boolean(endTimeAnchor)}
              anchorEl={endTimeAnchor}
              onClose={() => setEndTimeAnchor(null)}
              value={endTime}
              onChange={setEndTime}
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
            minRows={descriptionRows}
            maxRows={12}
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
