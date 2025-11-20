import type { Metadata } from 'next';
import { Box, Typography } from '@mui/material';
import { getTranslations, setRequestLocale } from 'next-intl/server';

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

  const t = await getTranslations({
    locale,
    namespace: 'Settings',
  });

  return (
    <Box>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'text.primary',
          mb: 1,
        }}
      >
        {t('page_title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {t('page_description')}
      </Typography>
    </Box>
  );
}
