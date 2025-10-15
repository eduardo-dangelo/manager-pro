import { Box, Typography } from '@mui/material';

type LogoProps = {
  variant: 'light' | 'dark';
};

export const Logo = ({ variant = 'light' }: LogoProps) => {
  return (
    <Box
      sx={{
        pb: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: '500',
          color: variant === 'light' ? 'white' : 'black',
          fontFamily: 'var(--font-nunito)',
        }}
      >
        Manager
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: '#60a5fa',
          fontFamily: 'var(--font-nunito)',
        }}
      >
        Pro
      </Typography>
    </Box>
  );
};
