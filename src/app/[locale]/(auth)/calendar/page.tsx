import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { CalendarClient } from './CalendarClient';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return {
    title: t('menu_calendar'),
  };
}

export default async function CalendarPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; year?: string; month?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const view = searchParams?.view;
  const defaultView = (view === 'month' || view === 'year' || view === 'schedule') ? view : undefined;
  const yearParam = searchParams?.year;
  const monthParam = searchParams?.month;
  let initialDate: Date | undefined;
  if (yearParam != null && monthParam != null) {
    const y = Number.parseInt(String(yearParam), 10);
    const m = Number.parseInt(String(monthParam), 10);
    if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
      initialDate = new Date(y, m - 1, 1);
    }
  }

  return (
    <CalendarClient
      locale={locale}
      defaultView={defaultView}
      initialDate={initialDate}
    />
  );
}
