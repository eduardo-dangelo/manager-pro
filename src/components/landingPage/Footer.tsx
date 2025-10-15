import {
  Facebook,
  LinkedIn,
  Twitter,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Logo } from '../Logo';

export const Footer = () => {
  return (
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
              <Logo variant="light" />
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
              © 2024 ManagerPro. All rights reserved.
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
  );
};
