import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ProjectService } from '@/services/projectService';
import { ProjectsPageClient } from '../ProjectsPageClient';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Projects',
  });

  return {
    title: t('type_trip'),
  };
}

export default async function TripProjectsPage(props: {
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

  // Fetch only trip projects
  const allProjects = await ProjectService.getProjectsByUserId(user.id);
  const projects = allProjects.filter(p => p.type === 'trip');

  return <ProjectsPageClient projects={projects} locale={locale} projectType="trip" />;
}
