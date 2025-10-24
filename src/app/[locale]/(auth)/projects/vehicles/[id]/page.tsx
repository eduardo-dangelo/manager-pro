import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { ProjectService } from '@/services/projectService';
import { ProjectDetail } from '../../[id]/ProjectDetail';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Projects',
  });

  const user = await currentUser();
  if (!user) {
    return {
      title: t('meta_title'),
    };
  }

  const projectId = Number.parseInt(id, 10);
  const project = await ProjectService.getProjectById(projectId, user.id);

  if (!project) {
    return {
      title: t('meta_title'),
    };
  }

  return {
    title: `${project.name} - ${t('meta_title')}`,
  };
}

export default async function VehicleProjectDetailPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;
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

  const projectId = Number.parseInt(id, 10);

  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await ProjectService.getProjectWithRelations(projectId, user.id);

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} locale={locale} />;
}
