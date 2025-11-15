import { ClerkProvider } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
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
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConditionalSidebar } from '@/components/ConditionalSidebar';
import { Sidebar } from '@/components/Sidebar';
import { routing } from '@/libs/I18nRouting';
import { ProjectService } from '@/services/projectService';
import { AppConfig, ClerkLocalizations } from '@/utils/AppConfig';

const DRAWER_WIDTH = 230;

// Map project types to their icons
const projectTypeIcons = {
  vehicle: DirectionsCar,
  property: HomeWork,
  cashflow: AttachMoney,
  trip: Flight,
  band: MusicNote,
};

// Helper function to pluralize project types for routes
const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    cashflow: 'cashflow',
    trip: 'trips',
    band: 'bands',
  };
  return pluralMap[type] || `${type}s`;
};

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const clerkLocale = ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let dashboardUrl = '/dashboard';
  let afterSignOutUrl = '/';

  if (locale !== routing.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`;
    signUpUrl = `/${locale}${signUpUrl}`;
    dashboardUrl = `/${locale}${dashboardUrl}`;
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`;
  }

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
      href: `/${locale}/year-planner`,
    },
    {
      icon: Folder,
      label: t('menu_projects'),
      href: `/${locale}/projects`,
    },
  ];

  // Add project type sub-items if they exist
  projectTypes.forEach((type) => {
    const icon = projectTypeIcons[type as keyof typeof projectTypeIcons];
    // Map project type to translation key
    const labelKey = `menu_${type}` as 'menu_vehicle' | 'menu_property' | 'menu_cashflow' | 'menu_trip' | 'menu_band';
    const pluralRoute = pluralizeType(type);
    menuItems.push({
      icon,
      label: t(labelKey),
      href: `/${locale}/projects/${pluralRoute}`,
      isSubItem: true,
    } as any);
  });

  // Add settings at the end
  menuItems.push({
    icon: SettingsIcon,
    label: t('menu_settings'),
    href: `/${locale}/settings`,
  });

  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk', // Ensure Clerk is compatible with Tailwind CSS v4
      }}
      localization={clerkLocale}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={dashboardUrl}
      signUpFallbackRedirectUrl={dashboardUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      <ConditionalSidebar
        sidebarContent={(
          <Sidebar
            drawerWidth={DRAWER_WIDTH}
            menuItems={menuItems}
            appName={AppConfig.name}
            signOutLabel={t('sign_out')}
          >
            {props.children}
          </Sidebar>
        )}
      >
        {props.children}
      </ConditionalSidebar>
    </ClerkProvider>
  );
}
