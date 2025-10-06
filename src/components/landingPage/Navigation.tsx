import {
  AppBar,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';

export const Navigation = () => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: 1,
        borderColor: 'grey.200',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          {/* Logo/Title */}
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: 'grey.900',
            }}
          >
            LoremSaaS
          </Typography>

          {/* Navigation Links */}
          <Stack
            direction="row"
            spacing={4}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            <Button
              href="#features"
              sx={{
                'color': 'grey.600',
                'textTransform': 'none',
                'fontWeight': 500,
                '&:hover': { color: 'grey.900' },
              }}
            >
              Features
            </Button>
            <Button
              href="#pricing"
              sx={{
                'color': 'grey.600',
                'textTransform': 'none',
                'fontWeight': 500,
                '&:hover': { color: 'grey.900' },
              }}
            >
              Pricing
            </Button>
            <Button
              href="#about"
              sx={{
                'color': 'grey.600',
                'textTransform': 'none',
                'fontWeight': 500,
                '&:hover': { color: 'grey.900' },
              }}
            >
              About
            </Button>
          </Stack>

          {/* Auth Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              component={Link}
              href="/sign-in"
              sx={{
                'color': 'grey.600',
                'fontWeight': 500,
                'textTransform': 'none',
                '&:hover': { color: 'grey.900' },
              }}
            >
              Log In
            </Button>
            <Button
              component={Link}
              href="/sign-up"
              variant="contained"
              sx={{
                'bgcolor': 'primary.main',
                'borderRadius': 2,
                'px': 3,
                'py': 1,
                'fontSize': '0.875rem',
                'fontWeight': 600,
                'textTransform': 'none',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
