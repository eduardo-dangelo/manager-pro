import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Nunito, Oswald } from 'next/font/google';
import { notFound } from 'next/navigation';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { routing } from '@/libs/I18nRouting';
import '@/styles/global.css';

// Configure Nunito font
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

// Configure Oswald font (for UK-style license plates)
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className={`${nunito.variable} ${oswald.variable}`}>
        <NextIntlClientProvider>
          <PostHogProvider>
            <ThemeProvider>
              {props.children}
            </ThemeProvider>
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
