import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { AssetService } from '@/services/assetService';
import { AssetDetail } from './AssetDetail';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Assets',
  });

  const user = await currentUser();
  if (!user) {
    return {
      title: t('meta_title'),
    };
  }

  const assetId = Number.parseInt(id, 10);
  const asset = await AssetService.getAssetById(assetId, user.id);

  if (!asset) {
    return {
      title: t('meta_title'),
    };
  }

  return {
    title: `${asset.name} - ${t('meta_title')}`,
  };
}

export default async function AssetDetailPage(props: {
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

  const assetId = Number.parseInt(id, 10);

  if (Number.isNaN(assetId)) {
    notFound();
  }

  const asset = await AssetService.getAssetWithRelations(assetId, user.id);

  if (!asset) {
    notFound();
  }

  return <AssetDetail asset={asset} locale={locale} />;
}
