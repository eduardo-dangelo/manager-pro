import {
  BarChart,
  CheckBox,
  Dashboard as DashboardIcon,
  Folder,
  People,
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
      label: t('menu_overview'),
      href: `/${locale}/dashboard`,
    },
    {
      icon: Folder,
      label: t('menu_projects'),
      href: `/${locale}/dashboard/projects`,
    },
    {
      icon: CheckBox,
      label: t('menu_tasks'),
      href: `/${locale}/dashboard/tasks`,
    },
    {
      icon: People,
      label: t('menu_team'),
      href: `/${locale}/dashboard/team`,
    },
    {
      icon: BarChart,
      label: t('menu_analytics'),
      href: `/${locale}/dashboard/analytics`,
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
