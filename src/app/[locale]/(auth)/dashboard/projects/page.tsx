import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { Add as AddIcon, Folder as FolderIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ProjectService } from '@/services/projectService';
import { ProjectsList } from './ProjectsList';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Projects',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function ProjectsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Sync user with database - ensures user exists before creating projects
  const { UserService } = await import('@/services/userService');
  await UserService.upsertUser({
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  });

  const t = await getTranslations({
    locale,
    namespace: 'Projects',
  });

  const projects = await ProjectService.getProjectsByUserId(user.id);
  console.log('projects', projects);

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
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
            {t('page_title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.600' }}>
            {t('page_description')}
          </Typography>
        </Box>
        {projects.length > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href={`/${locale}/dashboard/projects/new`}
            sx={{
              'bgcolor': '#1e293b',
              'color': 'white',
              'textTransform': 'none',
              'px': 3,
              'py': 1,
              'borderRadius': 2,
              '&:hover': {
                bgcolor: '#0f172a',
              },
            }}
          >
            {t('new_project')}
          </Button>
        )}
      </Box>

      {/* Empty State or Project List */}
      {projects.length === 0
        ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <FolderIcon sx={{ fontSize: 40, color: 'grey.400' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'grey.900',
                  mb: 1,
                }}
              >
                {t('empty_state_title')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'grey.600',
                  mb: 3,
                }}
              >
                {t('empty_state_description')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                href={`/${locale}/dashboard/projects/new`}
                sx={{
                  'bgcolor': '#1e293b',
                  'color': 'white',
                  'textTransform': 'none',
                  'px': 4,
                  'py': 1.5,
                  'borderRadius': 2,
                  '&:hover': {
                    bgcolor: '#0f172a',
                  },
                }}
              >
                {t('create_project')}
              </Button>
            </Box>
          )
        : (
            <ProjectsList projects={projects} locale={locale} />
          )}
    </Box>
  );
}
