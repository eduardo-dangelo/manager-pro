'use client';

import type { ReactNode } from 'react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';

export type DropdownOption = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
  sx?: object;
};

type DropdownButtonProps = {
  options: DropdownOption[];
  tooltip?: string;
  anchorOrigin?: {
    vertical: 'top' | 'bottom' | 'center';
    horizontal: 'left' | 'right' | 'center';
  };
  onOpen?: () => void;
  onClose?: () => void;
};

export function DropdownButton({
  options,
  tooltip = 'Actions',
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  onOpen,
  onClose,
}: DropdownButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    onOpen?.();
  };

  const handleClose = () => {
    setAnchorEl(null);
    onClose?.();
  };

  const handleOptionClick = (option: DropdownOption) => {
    option.onClick();
    handleClose();
  };

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size="small"
          onClick={handleOpen}
          onMouseDown={e => e.stopPropagation()}
          sx={{ color: 'text.secondary' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
      >
        {options.map((option, index) => (
          <Tooltip
            key={index}
            title={option.tooltip || ''}
            disableHoverListener={!option.tooltip}
            disableFocusListener={!option.tooltip}
            disableTouchListener={!option.tooltip}
          >
            <span>
              <MenuItem
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                sx={{
                  fontSize: '0.875rem',
                  ...option.sx,
                }}
              >
                {option.icon && (
                  <ListItemIcon sx={{ minWidth: 36, fontSize: '1rem' }}>
                    {option.icon}
                  </ListItemIcon>
                )}
                <ListItemText>{option.label}</ListItemText>
              </MenuItem>
            </span>
          </Tooltip>
        ))}
      </Menu>
    </>
  );
}
