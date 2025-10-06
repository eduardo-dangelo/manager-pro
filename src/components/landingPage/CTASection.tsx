import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import Link from 'next/link';

export const CTASection = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        py: { xs: 8, md: 10 },
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontSize: { xs: '2.25rem', md: '3rem' },
              fontWeight: 'bold',
              color: 'white',
              mb: 3,
            }}
          >
            Ready to get started?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.25rem',
              color: 'primary.light',
              mb: 4,
            }}
          >
            Join thousands of satisfied customers who trust our platform.
          </Typography>
          <Button
            component={Link}
            href="/sign-up"
            variant="contained"
            size="large"
            sx={{
              'bgcolor': 'white',
              'color': 'primary.main',
              'borderRadius': 2,
              'px': 4,
              'py': 2,
              'fontSize': '1.125rem',
              'fontWeight': 600,
              'textTransform': 'none',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Start Your Free Trial Today
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
