import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { AssetService } from '@/services/assetService';
import { AssetsPageClient } from './AssetsPageClient';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Assets',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function AssetsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Sync user with database - ensures user exists before creating assets
  const { UserService } = await import('@/services/userService');
  const { user: dbUser } = await UserService.upsertUser({
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  });

  const assets = await AssetService.getAssetsByUserId(user.id);

  // Get user preferences
  const userPreferences = {
    assetsViewMode: dbUser.projectsViewMode || 'folder',
    assetsCardSize: dbUser.projectsCardSize || 'medium',
    assetsSortBy: dbUser.projectsSortBy || 'dateModified',
  };

  return <AssetsPageClient assets={assets} locale={locale} userPreferences={userPreferences} />;
}
