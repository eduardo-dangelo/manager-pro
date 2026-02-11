'use client';

import { Box, Typography } from '@mui/material';

type RegistrationPlateProps = {
  registration: string;
  size?: 'small' | 'medium' | 'large';
};

export function RegistrationPlate({ registration, size = 'medium' }: RegistrationPlateProps) {
  // Format registration: add space after 4th character if not present
  const formattedReg = registration?.replace(/\s/g, '').replace(/(.{4})(.*)/, '$1 $2').trim();

  const sizeStyles = {
    small: {
      fontSize: '0.75rem',
      px: 1,
      py: 0.25,
    },
    medium: {
      fontSize: '1rem',
      px: 1.5,
      py: 0.5,
    },
    large: {
      fontSize: '1.25rem',
      px: 1.5,
      py: 0.75,
    },
  };

  const styles = sizeStyles[size];

  return (
    <Box
      sx={{
        backgroundColor: '#F9B233',
        px: styles.px,
        py: styles.py,
        borderRadius: 1,
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          color: '#000',
          fontSize: styles.fontSize,
          fontFamily: 'var(--font-oswald), "Impact", "Arial Black", sans-serif',
          letterSpacing: '0.08em',
          lineHeight: 1,
          textTransform: 'uppercase',
        }}
      >
        {formattedReg}
      </Typography>
    </Box>
  );
}
