import {
  Box,
  Card,
  Container,
  Grid,
  Typography,
} from '@mui/material';

export const FeaturesSection = () => {
  return (
    <Box
      id="features"
      sx={{
        bgcolor: 'grey.50',
        py: { xs: 8, md: 10 },
        px: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontSize: { xs: '2.25rem', md: '3rem' },
              fontWeight: 'bold',
              color: 'grey.900',
              mb: 3,
            }}
          >
            Sed ut perspiciatis unde omnis
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.25rem',
              color: 'grey.600',
              maxWidth: '3xl',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{
                'p': 4,
                'height': '100%',
                'borderRadius': 2,
                '&:hover': { elevation: 3 },
              }}
            >
              <Typography
                variant="h2"
                sx={{ fontSize: '3rem', mb: 2 }}
              >
                🚀
              </Typography>
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'grey.900',
                  mb: 2,
                }}
              >
                Fast & Reliable
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'grey.600',
                  lineHeight: 1.6,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{
                'p': 4,
                'height': '100%',
                'borderRadius': 2,
                '&:hover': { elevation: 3 },
              }}
            >
              <Typography
                variant="h2"
                sx={{ fontSize: '3rem', mb: 2 }}
              >
                🔒
              </Typography>
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'grey.900',
                  mb: 2,
                }}
              >
                Secure & Private
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'grey.600',
                  lineHeight: 1.6,
                }}
              >
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{
                'p': 4,
                'height': '100%',
                'borderRadius': 2,
                '&:hover': { elevation: 3 },
              }}
            >
              <Typography
                variant="h2"
                sx={{ fontSize: '3rem', mb: 2 }}
              >
                📈
              </Typography>
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'grey.900',
                  mb: 2,
                }}
              >
                Scalable Solution
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'grey.600',
                  lineHeight: 1.6,
                }}
              >
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
