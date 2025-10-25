import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ProjectService } from '@/services/projectService';
import { ProjectsPageClient } from './ProjectsPageClient';

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
  const { user: dbUser } = await UserService.upsertUser({
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  });

  const projects = await ProjectService.getProjectsByUserId(user.id);

  // Get user preferences
  const userPreferences = {
    projectsViewMode: dbUser.projectsViewMode || 'folder',
    projectsCardSize: dbUser.projectsCardSize || 'medium',
    projectsSortBy: dbUser.projectsSortBy || 'dateModified',
  };

  return <ProjectsPageClient projects={projects} locale={locale} userPreferences={userPreferences} />;
}
