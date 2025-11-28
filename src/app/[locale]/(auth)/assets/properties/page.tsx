import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { AssetService } from '@/services/assetService';
import { AssetsPageClient } from '../AssetsPageClient';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Assets',
  });

  return {
    title: t('type_property'),
  };
}

export default async function PropertyAssetsPage(props: {
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

  // Fetch only property assets
  const allAssets = await AssetService.getAssetsByUserId(user.id);
  const assets = allAssets.filter(a => a.type === 'property');

  return <AssetsPageClient assets={assets} locale={locale} assetType="property" />;
}

