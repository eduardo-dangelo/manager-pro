import type { Metadata } from 'next';
import { Box } from '@mui/material';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ContentSection,
  CTASection,
  FeaturesSection,
  Footer,
  Hero,
  Navigation,
  PricingSection,
} from '@/components/landingPage';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const _t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      <Navigation />
      <Hero />
      <ContentSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </Box>
  );
};
