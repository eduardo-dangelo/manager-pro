'use client';

import { Box, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

export type InlineEditableNameProps = {
  value: string;
  onChange: (value: string) => void;
  onSave: (value: string) => void;
  placeholder?: string;
  saving?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  size?: 'body2' | 'subtitle2';
};

const IDLE_SAVE_MS = 2500;
const HOVER_DELAY_MS = 500;

export function InlineEditableName({
  value,
  onChange,
  onSave,
  placeholder,
  saving = false,
  disabled = false,
  autoFocus = false,
  inputRef: externalInputRef,
  size = 'body2',
}: InlineEditableNameProps) {
  const t = useTranslations('Assets');
  const [localValue, setLocalValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const idleSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const setInputRef = useCallback(
    (el: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (typeof externalInputRef === 'function') {
        externalInputRef(el);
      } else if (externalInputRef) {
        (externalInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      }
    },
    [externalInputRef],
  );

  useEffect(() => {
    setLocalValue(value);
    lastSavedRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (idleSaveTimeoutRef.current) {
        clearTimeout(idleSaveTimeoutRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);

    if (idleSaveTimeoutRef.current) {
      clearTimeout(idleSaveTimeoutRef.current);
    }
    idleSaveTimeoutRef.current = setTimeout(() => {
      idleSaveTimeoutRef.current = null;
      lastSavedRef.current = newValue;
      onSave(newValue);
      inputRef.current?.blur();
    }, IDLE_SAVE_MS);
  };

  const handleBlur = () => {
    if (idleSaveTimeoutRef.current) {
      clearTimeout(idleSaveTimeoutRef.current);
      idleSaveTimeoutRef.current = null;
    }
    onSave(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (idleSaveTimeoutRef.current) {
        clearTimeout(idleSaveTimeoutRef.current);
        idleSaveTimeoutRef.current = null;
      }
      lastSavedRef.current = localValue;
      onSave(localValue);
      (inputRef as React.RefObject<HTMLInputElement>)?.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (idleSaveTimeoutRef.current) {
        clearTimeout(idleSaveTimeoutRef.current);
        idleSaveTimeoutRef.current = null;
      }
      setLocalValue(lastSavedRef.current);
      onChange(lastSavedRef.current);
      (inputRef as React.RefObject<HTMLInputElement>)?.current?.blur();
    }
  };

  const fontSize = size === 'subtitle2' ? '0.875rem' : '0.875rem';
  const fontWeight = size === 'subtitle2' ? 600 : 400;

  const handleWrapperClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef.current?.focus();
  };

  const handleWrapperPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWrapperClick}
      onPointerDown={handleWrapperPointerDown}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        flex: 1,
        cursor: 'text',
      }}
    >
      <TextField
        inputRef={setInputRef}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        variant="standard"
        fullWidth
        size="small"
        sx={{
          'flex': 1,
          'minWidth': 0,

          'padding': 0,
          '& .MuiInput-root': {
            'padding': 0,
            fontSize,
            fontWeight,
            'color': 'text.primary',
            '&:before': { borderBottom: 'none' },
            '&:after': { borderBottom: 'none' },
            '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
          },
          '& input': {
            padding: 0,
            overflow: 'visible',
          },
        }}
      />
      {saving && (
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          {t('saving')}
        </Typography>
      )}
    </Box>
  );
}
