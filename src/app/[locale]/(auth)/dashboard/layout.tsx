import {
  AttachMoney,
  CalendarMonth,
  Dashboard as DashboardIcon,
  DirectionsCar,
  Flight,
  Folder,
  HomeWork,
  MusicNote,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Sidebar } from '@/components/Sidebar';
import { ProjectService } from '@/services/projectService';
import { AppConfig } from '@/utils/AppConfig';

const DRAWER_WIDTH = 230;

// Map project types to their icons
const projectTypeIcons = {
  vehicle: DirectionsCar,
  property: HomeWork,
  cashflow: AttachMoney,
  trip: Flight,
  band: MusicNote,
};

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

  // Fetch current user and their projects to build dynamic menu
  const user = await currentUser();
  let projectTypes: string[] = [];

  if (user) {
    const projects = await ProjectService.getProjectsByUserId(user.id);
    // Get unique project types
    const uniqueTypes = new Set(projects.map(p => p.type));
    projectTypes = Array.from(uniqueTypes);
  }

  // Build base menu items
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
      icon: Folder,
      label: t('menu_projects'),
      href: `/${locale}/dashboard/projects`,
    },
  ];

  // Add project type sub-items if they exist
  projectTypes.forEach((type) => {
    const icon = projectTypeIcons[type as keyof typeof projectTypeIcons];
    // Map project type to translation key
    const labelKey = `menu_${type}` as 'menu_vehicle' | 'menu_property' | 'menu_cashflow' | 'menu_trip' | 'menu_band';
    menuItems.push({
      icon,
      label: t(labelKey),
      href: `/${locale}/dashboard/projects/${type}`,
      isSubItem: true,
    } as any);
  });

  // Add settings at the end
  menuItems.push({
    icon: SettingsIcon,
    label: t('menu_settings'),
    href: `/${locale}/dashboard/settings`,
  });

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
