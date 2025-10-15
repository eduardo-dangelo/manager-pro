import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { Box, Typography } from '@mui/material';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProjectForm } from '../ProjectForm';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Projects',
  });

  return {
    title: `${t('new_project')} - ${t('meta_title')}`,
  };
}

export default async function NewProjectPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Sync user with database
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

  const dashboardT = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  const breadcrumbItems = [
    { label: dashboardT('menu_overview'), href: `/${locale}/dashboard` },
    { label: t('page_title'), href: `/${locale}/dashboard/projects` },
    { label: t('new_project') },
  ];

  return (
    <Box>
      <Breadcrumb items={breadcrumbItems} />

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
          {t('new_project')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'grey.600' }}>
          {t('page_description')}
        </Typography>
      </Box>

      <ProjectForm locale={locale} />
    </Box>
  );
}
