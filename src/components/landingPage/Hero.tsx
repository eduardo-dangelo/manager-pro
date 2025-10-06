import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';

export const Hero = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
        py: { xs: 8, md: 10 },
        px: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', maxWidth: '4xl', mx: 'auto' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 'bold',
              color: 'grey.900',
              mb: 3,
              lineHeight: 1.1,
            }}
          >
            Lorem Ipsum SaaS Platform
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: 'grey.600',
              mb: 4,
              lineHeight: 1.6,
              maxWidth: '3xl',
              mx: 'auto',
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
              component={Link}
              href="/sign-up"
              variant="contained"
              size="large"
              sx={{
                'bgcolor': 'primary.main',
                'borderRadius': 2,
                'px': 4,
                'py': 1.5,
                'fontSize': '1.125rem',
                'fontWeight': 600,
                'textTransform': 'none',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Get Started Free
            </Button>
            <Button
              href="#features"
              variant="outlined"
              size="large"
              sx={{
                'border': 2,
                'borderColor': 'primary.main',
                'color': 'primary.main',
                'borderRadius': 2,
                'px': 4,
                'py': 1.5,
                'fontSize': '1.125rem',
                'fontWeight': 600,
                'textTransform': 'none',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main',
                },
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};
