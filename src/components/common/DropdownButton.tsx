'use client';

import type { ReactNode } from 'react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';

export type DropdownOption = {
  label: string;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
  sx?: object;
  /** When true, the menu stays open after clicking this option (e.g. for opening a submenu/popover). */
  keepOpenOnClick?: boolean;
};

type DropdownButtonProps = {
  options: DropdownOption[];
  tooltip?: string;
  /** Icon to show. Default MoreVert. Use MoreHoriz for horizontal dots. */
  icon?: ReactNode;
  anchorOrigin?: {
    vertical: 'top' | 'bottom' | 'center';
    horizontal: 'left' | 'right' | 'center';
  };
  onOpen?: () => void;
  onClose?: () => void;
  /** Called when the menu opens, with a function to close it. Use for closing from outside (e.g. when a submenu/popover closes). */
  registerClose?: (close: () => void) => void;
};

export function DropdownButton({
  options,
  tooltip = 'Actions',
  icon,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  onOpen,
  onClose,
  registerClose,
}: DropdownButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open && registerClose) {
      registerClose(handleClose);
    }
  }, [open, registerClose, handleClose]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    onOpen?.();
  };

  const handleOptionClick = (option: DropdownOption, event: React.MouseEvent<HTMLElement>) => {
    option.onClick?.(event);
    if (!option.keepOpenOnClick) {
      handleClose();
    }
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
          {icon ?? <MoreVertIcon fontSize="small" />}
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
                onClick={(e) => handleOptionClick(option, e)}
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
