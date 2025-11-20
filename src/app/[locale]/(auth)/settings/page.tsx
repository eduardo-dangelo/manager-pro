import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SettingsContent } from '@/components/Settings/SettingsContent';

type ISettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISettingsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Settings',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function SettingsPage(props: ISettingsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <SettingsContent />;
}
