import {
  AccountBalanceWallet,
  CalendarMonth,
  Dashboard as DashboardIcon,
  DirectionsCar,
  Folder,
  HomeWork,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Sidebar } from '@/components/Sidebar';
import { AppConfig } from '@/utils/AppConfig';

const DRAWER_WIDTH = 230;

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  const menuItems = [
    {
      icon: DashboardIcon,
      label: t('menu_dashboard'),
      href: `/${locale}/dashboard`,
    },
    {
      icon: CalendarMonth,
      label: t('menu_year_planner'),
      href: `/${locale}/dashboard/year-planner`,
    },
    {
      icon: AccountBalanceWallet,
      label: t('menu_cash_flow'),
      href: `/${locale}/dashboard/cash-flow`,
    },
    {
      icon: Folder,
      label: t('menu_projects'),
      href: `/${locale}/dashboard/projects`,
    },
    {
      icon: HomeWork,
      label: t('menu_properties'),
      href: `/${locale}/dashboard/properties`,
    },
    {
      icon: DirectionsCar,
      label: t('menu_vehicles'),
      href: `/${locale}/dashboard/vehicles`,
    },
    {
      icon: SettingsIcon,
      label: t('menu_settings'),
      href: `/${locale}/dashboard/settings`,
    },
  ];

  return (
    <Sidebar
      drawerWidth={DRAWER_WIDTH}
      menuItems={menuItems}
      appName={AppConfig.name}
      signOutLabel={t('sign_out')}
    >
      {props.children}
    </Sidebar>
  );
}
