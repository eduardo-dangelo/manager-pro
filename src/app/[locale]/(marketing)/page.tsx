import type { Metadata } from 'next';
import {
  Check,
  Facebook,
  LinkedIn,
  Twitter,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      {/* Top Navigation Bar */}
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

      {/* Hero Section */}
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

      {/* Content Section */}
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

      {/* Another Content Section */}
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

      {/* Pricing Section */}
      <Box
        id="pricing"
        sx={{
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
              Simple, Transparent Pricing
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.25rem',
                color: 'grey.600',
              }}
            >
              Choose the plan that's right for you. No hidden fees, no surprises.
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
            {/* Starter Plan */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={1}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'grey.200',
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'grey.900',
                      mb: 1,
                    }}
                  >
                    Starter
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: 'grey.900',
                      mb: 1,
                    }}
                  >
                    $9
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    per month
                  </Typography>
                </Box>
                <List sx={{ mb: 4 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Lorem ipsum dolor sit amet"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Consectetur adipiscing elit"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Sed do eiusmod tempor"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Basic support included"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                </List>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{
                    'border': 2,
                    'borderColor': 'primary.main',
                    'color': 'primary.main',
                    'borderRadius': 2,
                    'py': 1.5,
                    'fontSize': '1rem',
                    'fontWeight': 600,
                    'textTransform': 'none',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  Start Free Trial
                </Button>
              </Card>
            </Grid>

            {/* Professional Plan */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  position: 'relative',
                  transform: { xs: 'none', md: 'scale(1.05)' },
                }}
              >
                <Chip
                  label="Most Popular"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'warning.main',
                    color: 'grey.900',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                />
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Professional
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      mb: 1,
                    }}
                  >
                    $29
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.light' }}>
                    per month
                  </Typography>
                </Box>
                <List sx={{ mb: 4 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.light', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="Everything in Starter" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.light', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="Incididunt ut labore et dolore" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.light', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="Magna aliqua ut enim ad minim" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.light', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="Priority support" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.light', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="Advanced analytics" />
                  </ListItem>
                </List>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    'bgcolor': 'white',
                    'color': 'primary.main',
                    'borderRadius': 2,
                    'py': 1.5,
                    'fontSize': '1rem',
                    'fontWeight': 600,
                    'textTransform': 'none',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Start Free Trial
                </Button>
              </Card>
            </Grid>

            {/* Enterprise Plan */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={1}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'grey.200',
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'grey.900',
                      mb: 1,
                    }}
                  >
                    Enterprise
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: 'grey.900',
                      mb: 1,
                    }}
                  >
                    $99
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    per month
                  </Typography>
                </Box>
                <List sx={{ mb: 4 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Everything in Professional"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Veniam quis nostrud exercitation"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ullamco laboris nisi ut aliquip"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dedicated account manager"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Custom integrations"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Check sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="24/7 phone support"
                      primaryTypographyProps={{ color: 'grey.600' }}
                    />
                  </ListItem>
                </List>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{
                    'border': 2,
                    'borderColor': 'primary.main',
                    'color': 'primary.main',
                    'borderRadius': 2,
                    'py': 1.5,
                    'fontSize': '1rem',
                    'fontWeight': 600,
                    'textTransform': 'none',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  Contact Sales
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
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

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: { xs: 6, md: 8 },
          px: 2,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {/* Company Info */}
            <Grid item xs={12} md={6} lg={3}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  LoremSaaS
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'grey.300',
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    href="#"
                    sx={{
                      'color': 'grey.400',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton
                    href="#"
                    sx={{
                      'color': 'grey.400',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                    href="#"
                    sx={{
                      'color': 'grey.400',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    <LinkedIn />
                  </IconButton>
                </Stack>
              </Box>
            </Grid>

            {/* Product */}
            <Grid item xs={12} md={6} lg={3}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  component="h4"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Product
                </Typography>
                <Stack spacing={1}>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Features
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Pricing
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Integrations
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    API Documentation
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Changelog
                  </Button>
                </Stack>
              </Box>
            </Grid>

            {/* Company */}
            <Grid item xs={12} md={6} lg={3}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  component="h4"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Company
                </Typography>
                <Stack spacing={1}>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    About Us
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Careers
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Blog
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Press
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Contact
                  </Button>
                </Stack>
              </Box>
            </Grid>

            {/* Support */}
            <Grid item xs={12} md={6} lg={3}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  component="h4"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Support
                </Typography>
                <Stack spacing={1}>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Help Center
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Community
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Status
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Security
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Privacy Policy
                  </Button>
                  <Button
                    href="#"
                    sx={{
                      'color': 'grey.300',
                      'textTransform': 'none',
                      'justifyContent': 'flex-start',
                      'p': 0,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    Terms of Service
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Footer */}
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: 1,
              borderColor: 'grey.800',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                © 2024 LoremSaaS. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={3}>
                <Button
                  href="#"
                  sx={{
                    'color': 'grey.400',
                    'textTransform': 'none',
                    'fontSize': '0.875rem',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Privacy Policy
                </Button>
                <Button
                  href="#"
                  sx={{
                    'color': 'grey.400',
                    'textTransform': 'none',
                    'fontSize': '0.875rem',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Terms of Service
                </Button>
                <Button
                  href="#"
                  sx={{
                    'color': 'grey.400',
                    'textTransform': 'none',
                    'fontSize': '0.875rem',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Cookie Policy
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
