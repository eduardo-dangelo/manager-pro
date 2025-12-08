import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import {
  Avatar,
  Box,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/common/Card';
import { Hello } from '@/components/Hello';
import { UserService } from '@/services/userService';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function Dashboard() {
  const user = await currentUser();

  // Sync user with database - creates if doesn't exist, updates if it does
  let dbUser = null;
  if (user) {
    const result = await UserService.upsertUser({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });
    dbUser = result.user;
  }
  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'grey.900',
            mb: 1,
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.600' }}>
          Welcome back
          {' '}
          {dbUser?.firstName}
          ! Here's an overview of your workspace.
        </Typography>
      </Box>

      {/* Content */}
      <Stack spacing={3}>
        <Hello />

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'grey.600',
                  }}
                >
                  Total Projects
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'grey.900',
                    mt: 1,
                  }}
                >
                  12
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    color: 'grey.500',
                    mt: 1,
                  }}
                >
                  +2 from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'grey.600',
                  }}
                >
                  Active Tasks
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'grey.900',
                    mt: 1,
                  }}
                >
                  48
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    color: 'grey.500',
                    mt: 1,
                  }}
                >
                  +6 from last week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'grey.600',
                  }}
                >
                  Team Members
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'grey.900',
                    mt: 1,
                  }}
                >
                  8
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    color: 'grey.500',
                    mt: 1,
                  }}
                >
                  +1 new member
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'grey.600',
                  }}
                >
                  Completion Rate
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'grey.900',
                    mt: 1,
                  }}
                >
                  87%
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    color: 'grey.500',
                    mt: 1,
                  }}
                >
                  +5% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'grey.900',
              }}
            >
              Recent Activity
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: 'blue.100',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {' '}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'grey.900',
                      }}
                    >
                      New project created: Website Redesign
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        color: 'grey.500',
                      }}
                    >
                      2 hours ago
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: 'green.100',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {' '}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'grey.900',
                      }}
                    >
                      Task completed: Update homepage design
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        color: 'grey.500',
                      }}
                    >
                      5 hours ago
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: 'purple.100',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {' '}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'grey.900',
                      }}
                    >
                      New team member joined: Sarah Johnson
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        color: 'grey.500',
                      }}
                    >
                      1 day ago
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
