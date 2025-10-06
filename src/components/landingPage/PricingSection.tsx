import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { Check } from '@mui/icons-material';
import Link from 'next/link';

export const PricingSection = () => {
  return (
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
                component={Link}
                href="/sign-up"
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
                component={Link}
                href="/sign-up"
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
  );
};
