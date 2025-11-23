'use client';

import { UserProfile } from '@clerk/nextjs';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Dialog,
  IconButton,
} from '@mui/material';

type UserProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: '880px',
          borderRadius: 2,
          maxHeight: '90vh',
          position: 'relative',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    >
      {/* Floating close button */}
      <IconButton
        onClick={onClose}
        aria-label="close"
        size="small"
        sx={{
          'position': 'absolute',
          'top': 8,
          'right': 8,
          'zIndex': 1,
          'color': 'rgba(0, 0, 0, 0.6)',
          'bgcolor': '#ffffff',
          'boxShadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            bgcolor: '#f5f5f5',
            color: 'rgba(0, 0, 0, 0.87)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Clerk UserProfile - no wrapper */}
      <Box
        sx={{
          width: '100%',
        }}
      >
        <UserProfile routing="virtual" />
      </Box>
    </Dialog>
  );
}
