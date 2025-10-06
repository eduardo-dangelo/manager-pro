import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';

export const ContentSection = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 10 }, px: 2 }}>
      <Container maxWidth="xl">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
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
              Lorem ipsum dolor sit amet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.125rem',
                color: 'grey.600',
                mb: 3,
                lineHeight: 1.7,
              }}
            >
              Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.125rem',
                color: 'grey.600',
                mb: 4,
                lineHeight: 1.7,
              }}
            >
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </Typography>
            <Button
              variant="contained"
              sx={{
                'bgcolor': 'grey.900',
                'borderRadius': 2,
                'px': 3,
                'py': 1.5,
                'fontSize': '1rem',
                'fontWeight': 600,
                'textTransform': 'none',
                '&:hover': { bgcolor: 'grey.800' },
              }}
            >
              Explore Features
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={1}
              sx={{
                height: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                borderRadius: 2,
                p: 4,
              }}
            >
              <Box sx={{ textAlign: 'center', color: 'grey.500' }}>
                <Typography
                  variant="h2"
                  sx={{ fontSize: '4rem', mb: 2 }}
                >
                  📊
                </Typography>
                <Typography variant="h6">
                  Feature showcase placeholder
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
