import { ClerkProvider } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import {
  CalendarMonth,
  Dashboard as DashboardIcon,
  DirectionsCar,
  Flight,
  Folder,
  HomeWork,
  Person,
  Settings as SettingsIcon,
  Storage,
} from '@mui/icons-material';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConditionalSidebar } from '@/components/ConditionalSidebar';
import { Sidebar } from '@/components/Sidebar';
import { routing } from '@/libs/I18nRouting';
import { AssetService } from '@/services/assetService';
import { AppConfig, ClerkLocalizations } from '@/utils/AppConfig';

const DRAWER_WIDTH = 280;

// Map asset types to their icons
const assetTypeIcons = {
  vehicle: DirectionsCar,
  property: HomeWork,
  person: Person,
  project: Folder,
  trip: Flight,
};

// Helper function to pluralize asset types for routes
const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    person: 'persons',
    project: 'projects',
    trip: 'trips',
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

  // Fetch current user and their assets to build dynamic menu
  const user = await currentUser();
  let assetTypes: string[] = [];

  if (user) {
    const assets = await AssetService.getAssetsByUserId(user.id);
    // Get unique asset types
    const uniqueTypes = new Set(assets.map(a => a.type));
    assetTypes = Array.from(uniqueTypes);
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
      icon: Storage,
      label: t('menu_projects'),
      href: `/${locale}/assets`,
    },
  ];

  // Add asset type sub-items if they exist
  assetTypes.forEach((type) => {
    const icon = assetTypeIcons[type as keyof typeof assetTypeIcons];
    // Map asset type to translation key
    const labelKey = `menu_${type}` as 'menu_vehicle' | 'menu_property' | 'menu_person' | 'menu_project' | 'menu_trip';
    const pluralRoute = pluralizeType(type);
    menuItems.push({
      icon,
      label: t(labelKey),
      href: `/${locale}/assets/${pluralRoute}`,
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
