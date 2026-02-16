'use client';

import { Box, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { RegistrationPlate } from '@/components/common/RegistrationPlate';

type Asset = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  type?: string | null;
};

type AssetHeaderProps = {
  asset: Asset;
  locale: string;
  onUpdate: (updates: Partial<Asset>) => Promise<void>;
  actions?: React.ReactNode;
  registration?: string;
};

export function AssetHeader({
  asset,
  locale: _locale,
  onUpdate,
  actions,
  registration,
}: AssetHeaderProps) {
  const t = useTranslations('Assets');
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const idleSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestNameRef = useRef(asset.name);
  const [localAsset, setLocalAsset] = useState(asset);
  const [saving, setSaving] = useState(false);

  // Sync local state when asset prop changes
  useEffect(() => {
    setLocalAsset(asset);
    latestNameRef.current = asset.name;
  }, [asset]);

  // Cleanup idle-save timeout on unmount
  useEffect(() => {
    return () => {
      if (idleSaveTimeoutRef.current) {
        clearTimeout(idleSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async (updates: Partial<Asset>) => {
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalAsset({ ...localAsset, name: value });
    latestNameRef.current = value;

    if (idleSaveTimeoutRef.current) {
      clearTimeout(idleSaveTimeoutRef.current);
    }
    idleSaveTimeoutRef.current = setTimeout(() => {
      idleSaveTimeoutRef.current = null;
      handleSave({ name: latestNameRef.current });
      titleRef.current?.blur();
    }, 2500);
  };

  const handleTitleBlur = () => {
    if (idleSaveTimeoutRef.current) {
      clearTimeout(idleSaveTimeoutRef.current);
      idleSaveTimeoutRef.current = null;
    }
    handleSave({ name: localAsset.name });
  };

  // Get placeholder text - show "New {{asset type}}" if name is empty and type exists
  const getPlaceholder = () => {
    if (!localAsset.name && localAsset.type) {
      const typeLabel = t(`type_${localAsset.type}` as any);
      return `New ${typeLabel}`;
    }
    return t('project_name');
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1 }}>
          {registration && (
            <Box sx={{ mt: 3 }}>
              <RegistrationPlate registration={registration} size="large" />
            </Box>
          )}
          <TextField
            inputRef={titleRef}
            value={localAsset.name}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            placeholder={getPlaceholder()}
            variant="standard"
            sx={{
              'flex': 1,
              'overflow': 'visible',
              '& .MuiInput-root': {
                // 'width': '100%',
                // 'border': '1px solid pink',
                'overflow': 'visible',
                'fontSize': '2.5rem',
                'fontWeight': 700,
                'color': 'text.primary',
                '&:before': { borderBottom: 'none' },
                '&:after': { borderBottom: 'none' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
              },
              '& input': {
                // padding: '8px 0',
                overflow: 'visible',
              },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
          <Select
            value={localAsset.status}
            onChange={(e) => {
              const newStatus = e.target.value;
              setLocalAsset({ ...localAsset, status: newStatus });
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
                  localAsset.status === 'active'
                    ? 'primary.50'
                    : localAsset.status === 'completed'
                      ? 'success.50'
                      : localAsset.status === 'archived'
                        ? 'grey.100'
                        : 'warning.50',
                'color':
                  localAsset.status === 'active'
                    ? 'primary.700'
                    : localAsset.status === 'completed'
                      ? 'success.700'
                      : localAsset.status === 'archived'
                        ? 'grey.700'
                        : 'warning.700',
                'fontWeight': 500,
                '&:hover': {
                  backgroundColor:
                    localAsset.status === 'active'
                      ? 'primary.100'
                      : localAsset.status === 'completed'
                        ? 'success.100'
                        : localAsset.status === 'archived'
                          ? 'grey.200'
                          : 'warning.100',
                },
              },
              '& .MuiSelect-icon': {
                color:
                  localAsset.status === 'active'
                    ? 'primary.700'
                    : localAsset.status === 'completed'
                      ? 'success.700'
                      : localAsset.status === 'archived'
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
          {actions}
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
    </>
  );
}
