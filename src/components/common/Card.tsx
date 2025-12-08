'use client';

import type { CardProps } from '@mui/material';
import { Card as MuiCard } from '@mui/material';

export const Card = ({ ref, sx, ...props }: CardProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <MuiCard
      ref={ref}
      sx={{
        boxShadow: 'none',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        ...sx,
      }}
      {...props}
    />
  );
};

Card.displayName = 'Card';
