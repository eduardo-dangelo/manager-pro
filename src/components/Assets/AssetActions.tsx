'use client';

import { MoreVert as MoreIcon } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react';

type AssetActionsProps = {
  assetId: number;
  locale: string;
  onDeleted?: () => void;
  onCompleted?: () => void;
};

export function AssetActions({ assetId, locale, onDeleted, onCompleted }: AssetActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const markComplete = async () => {
    try {
      await fetch(`/${locale}/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      onCompleted?.();
    } catch (e) {
      console.error(e);
    } finally {
      handleClose();
    }
  };

  const deleteAsset = async () => {
    try {
      await fetch(`/${locale}/api/assets/${assetId}`, { method: 'DELETE' });
      onDeleted?.();
    } catch (e) {
      console.error(e);
    } finally {
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title="Asset actions">
        <IconButton sx={{ color: 'text.secondary' }} size="small" onClick={handleOpen} onMouseDown={e => e.stopPropagation()}>
          <MoreIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MenuItem onClick={markComplete}>Mark as complete</MenuItem>
        <MenuItem onClick={deleteAsset} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>
    </>
  );
}

