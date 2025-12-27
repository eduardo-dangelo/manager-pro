'use client';

import type { ReactNode } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import {
  ChevronRight,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useHoverSound } from '@/hooks/useHoverSound';
import { NewAssetButton } from './Assets/NewAssetButton';
import { BreadcrumbProvider } from './BreadcrumbContext';
import { GlobalTopbar } from './GlobalTopbar';
import { GlobalTopbarContentProvider } from './GlobalTopbarContentContext';
import { Logo } from './Logo';
import { TopbarActions } from './TopbarActions';

type MenuItem = {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  isSubItem?: boolean;
};

type SidebarProps = {
  children: ReactNode;
  drawerWidth: number;
  menuItems: MenuItem[];
  appName: string;
  signOutLabel: string;
};

export function Sidebar({
  children,
  drawerWidth,
  menuItems,
  appName: _appName,
  signOutLabel,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set());
  const [clickedHref, setClickedHref] = useState<string | null>(null);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const pathname = usePathname();
  const { playHoverSound } = useHoverSound();

  // Extract locale from pathname once
  const locale = (() => {
    const match = pathname.match(/^\/([a-z]{2})\//);
    return match ? match[1] : 'en';
  })();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    // Remove locale prefix from both pathname and href for comparison
    const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/');
    const hrefWithoutLocale = href.replace(/^\/[a-z]{2}\//, '/');

    // If an item was clicked, only that item should be active (optimistic UI update)
    // This ensures the previous active item loses its active state immediately
    if (clickedHref) {
      const clickedHrefWithoutLocale = clickedHref.replace(/^\/[a-z]{2}\//, '/');
      return hrefWithoutLocale === clickedHrefWithoutLocale;
    }

    // Exact match
    if (pathnameWithoutLocale === hrefWithoutLocale) {
      return true;
    }

    // For sub-routes, only highlight the most specific matching route
    // This prevents multiple parent routes from being highlighted
    if (pathnameWithoutLocale.startsWith(`${hrefWithoutLocale}/`)) {
      // Check if there's a more specific route in the menu that also matches
      // If we're on /assets/vehicles/123, we want to highlight /assets/vehicles, not /assets
      const allMenuHrefs = menuItems.map(item => item.href.replace(/^\/[a-z]{2}\//, '/'));

      // Find the most specific matching route
      const matchingRoutes = allMenuHrefs.filter(menuHref =>
        pathnameWithoutLocale.startsWith(`${menuHref}/`) || pathnameWithoutLocale === menuHref,
      );

      // Only highlight if this is the most specific match
      return matchingRoutes.length > 0 && hrefWithoutLocale === matchingRoutes.sort((a, b) => b.length - a.length)[0];
    }

    return false;
  };

  // Group menu items by parent-child relationship
  const groupMenuItems = useCallback(() => {
    const groupedItems: Array<{ parent: MenuItem; children: MenuItem[] }> = [];
    let currentParent: MenuItem | null = null;
    let currentChildren: MenuItem[] = [];

    menuItems.forEach((item) => {
      if (item.isSubItem) {
        if (currentParent) {
          currentChildren.push(item);
        }
      } else {
        if (currentParent) {
          groupedItems.push({ parent: currentParent, children: currentChildren });
        }
        const itemIndex = menuItems.indexOf(item);
        const nextItemsAreSubItems = menuItems
          .slice(itemIndex + 1)
          .some(nextItem => nextItem.isSubItem);

        if (nextItemsAreSubItems) {
          currentParent = item;
          currentChildren = [];
        } else {
          groupedItems.push({ parent: item, children: [] });
          currentParent = null;
          currentChildren = [];
        }
      }
    });

    if (currentParent) {
      groupedItems.push({ parent: currentParent, children: currentChildren });
    }

    return groupedItems;
  }, [menuItems]);

  // Auto-expand parent items if any child is active
  useEffect(() => {
    const groupedItems = groupMenuItems();
    groupedItems.forEach((group) => {
      const hasActiveChild = group.children.some(child => isActive(child.href));
      if (hasActiveChild) {
        setExpandedItems((prev) => {
          if (!prev.has(group.parent.href)) {
            return new Set(prev).add(group.parent.href);
          }
          return prev;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, groupMenuItems]);

  // Clear clicked state when pathname changes (navigation completes)
  useEffect(() => {
    setClickedHref(null);
  }, [pathname]);

  // Helper function to extract asset type from href
  const extractAssetTypeFromHref = (href: string, locale: string): string | null => {
    const hrefWithoutLocale = href.replace(/^\/[a-z]{2}\//, '/');
    const assetsPattern = new RegExp(`^/assets/(vehicles|properties|persons|projects|trips|customs)$`);
    const match = hrefWithoutLocale.match(assetsPattern);

    if (match) {
      const pluralType = match[1];
      // Reverse mapping from plural to singular
      const typeMap: Record<string, string> = {
        vehicles: 'vehicle',
        properties: 'property',
        persons: 'person',
        projects: 'project',
        trips: 'trip',
        customs: 'custom',
      };
      return typeMap[pluralType] || null;
    }

    return null;
  };

  // Helper function to check if item is parent Assets item
  const isAssetsParentItem = (href: string, locale: string): boolean => {
    const hrefWithoutLocale = href.replace(/^\/[a-z]{2}\//, '/');
    return hrefWithoutLocale === '/assets';
  };

  // Helper function to check if item is an asset subitem
  const isAssetSubItem = (href: string, locale: string): boolean => {
    return extractAssetTypeFromHref(href, locale) !== null;
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo - Hidden on mobile */}
      {!isMobile && (
        <Box sx={{ px: 3, pt: 2, pb: 0 }}>
          <Logo variant={isMobile ? 'dark' : 'light'} />
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 2, py: isMobile ? 3 : 2, mt: isMobile ? 5 : 0 }}>
        {groupMenuItems().map((group) => {
          const { parent, children } = group;
          const Icon = parent.icon;
          const active = isActive(parent.href);
          const isExpanded = expandedItems.has(parent.href);
          const hasChildren = children.length > 0;
          const hasActiveChild = children.some(child => isActive(child.href));

          const isAssetsParent = isAssetsParentItem(parent.href, locale);
          const isHovered = hoveredHref === parent.href;

          return (
            <Box key={parent.href}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={parent.href}
                  onMouseEnter={(e) => {
                    playHoverSound();
                    setHoveredHref(parent.href);
                  }}
                  onMouseLeave={() => {
                    setHoveredHref(null);
                  }}
                  onClick={() => {
                    setClickedHref(parent.href);
                    toggleExpanded(parent.href);
                  }}
                  sx={{
                    'borderRadius': 2,
                    'color': active ? theme.palette.sidebar.textPrimary : theme.palette.sidebar.textSecondary,
                    'bgcolor': active ? (theme.palette.mode === 'dark' ? theme.palette.action.selected : 'rgba(255, 255, 255, 0.12)') : 'transparent',
                    'pl': 2,
                    'pr': hasChildren ? 0.5 : 2,
                    'py': 0.5,
                    'minHeight': 40,
                    'height': 40,
                    'boxShadow': active ? theme.shadows[8] : 'none',
                    'transition': 'boxShadow 0.3s ease-in-out, background-color 0.3s ease-in-out',
                    '&:hover': {
                      'bgcolor': theme.palette.mode === 'dark' ? theme.palette.action.selected : 'rgba(255, 255, 255, 0.12)',
                      'color': theme.palette.sidebar.textPrimary,
                      'boxShadow': active ? theme.shadows[8] : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon
                      sx={{
                        fontSize: 20,
                        color: theme.palette.primary.main,
                        transition: 'color 0.2s',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={parent.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isAssetsParent && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          lineHeight: 0,
                          height: 'fit-content',
                          opacity: isHovered ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <NewAssetButton
                          locale={locale}
                          iconButtonSx={{
                            'color': theme.palette.sidebar.textSecondary,
                            'bgcolor': 'transparent',
                            'borderRadius': '50%',
                            '& > svg': {
                              color: theme.palette.sidebar.textSecondary,
                            },
                            '&:hover': {
                              color: theme.palette.sidebar.textPrimary,
                              bgcolor: theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.08)',
                            },
                          }}
                        />
                      </Box>
                    )}
                    {hasChildren && (
                      <IconButton
                        size="small"
                        onMouseEnter={playHoverSound}
                        sx={{
                          'color': theme.palette.sidebar.textSecondary,
                          'p': 0.5,
                          'mr': 0.5,
                          'transition': 'transform 0.2s, color 0.2s',
                          'transform': isExpanded || hasActiveChild ? 'rotate(90deg)' : 'rotate(0deg)',
                          '&:hover': {
                            color: theme.palette.sidebar.textPrimary,
                            bgcolor: theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.08)',
                          },
                        }}
                      >
                        <ChevronRight sx={{ fontSize: 20 }} />
                      </IconButton>
                    )}
                  </Box>
                </ListItemButton>
              </ListItem>
              {hasChildren && (
                <Collapse in={isExpanded || hasActiveChild} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);
                      const assetType = extractAssetTypeFromHref(child.href, locale);
                      const isAssetSub = isAssetSubItem(child.href, locale);
                      const isChildHovered = hoveredHref === child.href;

                      return (
                        <ListItem key={child.href} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            component={Link}
                            href={child.href}
                            onMouseEnter={(e) => {
                              playHoverSound();
                              setHoveredHref(child.href);
                            }}
                            onMouseLeave={() => {
                              setHoveredHref(null);
                            }}
                            onClick={() => {
                              setClickedHref(child.href);
                            }}
                            sx={{
                              'borderRadius': 2,
                              'color': childActive ? theme.palette.sidebar.textPrimary : theme.palette.sidebar.textSecondary,
                              'bgcolor': childActive ? (theme.palette.mode === 'dark' ? theme.palette.action.selected : 'rgba(255, 255, 255, 0.12)') : 'transparent',
                              'pl': 4,
                              'pr': 2,
                              'py': 0.5,
                              'minHeight': 40,
                              'height': 40,
                              'boxShadow': childActive ? theme.shadows[8] : 'none',
                              'transition': 'boxShadow 0.3s ease-in-out, background-color 0.3s ease-in-out',
                              '&:hover': {
                                'bgcolor': theme.palette.mode === 'dark' ? theme.palette.action.selected : 'rgba(255, 255, 255, 0.12)',
                                'color': theme.palette.sidebar.textPrimary,
                                'boxShadow': childActive ? theme.shadows[8] : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                                '& .MuiListItemIcon-root': {
                                  color: theme.palette.primary.main,
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <ChildIcon
                                sx={{
                                  fontSize: 20,
                                  color: theme.palette.primary.main,
                                  transition: 'color 0.2s',
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                              }}
                            />
                            {isAssetSub && assetType && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  lineHeight: 0,
                                  height: 'fit-content',
                                  opacity: isChildHovered ? 1 : 0,
                                  transition: 'opacity 0.3s ease',
                                  ml: 'auto',
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <NewAssetButton
                                  locale={locale}
                                  preSelectedType={assetType}
                                  iconButtonSx={{
                                    'color': theme.palette.sidebar.textSecondary,
                                    'bgcolor': 'transparent',
                                    'borderRadius': '50%',
                                    '& > svg': {
                                      color: theme.palette.sidebar.textSecondary,
                                    },
                                    '&:hover': {
                                      color: theme.palette.sidebar.textPrimary,
                                      bgcolor: theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.08)',
                                    },
                                  }}
                                />
                              </Box>
                            )}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>

      {/* Footer - Logout */}
      <Box>
        <List sx={{ px: 2, py: 2 }}>
          <ListItem disablePadding>
            {/* eslint-disable-next-line react/component-name-casing */}
            <SignOutButton>
              <ListItemButton
                onMouseEnter={playHoverSound}
                sx={{
                  'borderRadius': 2,
                  'color': theme.palette.sidebar.textSecondary,
                  '&:hover': {
                    'bgcolor': theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.08)',
                    'color': theme.palette.sidebar.textPrimary,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon
                    sx={{
                      fontSize: 20,
                      color: theme.palette.primary.main,
                      transition: 'color 0.2s',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={signOutLabel}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </SignOutButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: theme.palette.background.default, overflow: 'hidden' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: 'background.default',
            display: { xs: 'block', lg: 'none' },
            zIndex: theme => theme.zIndex.drawer + 1,
            transition: 'background-color 0.3s ease',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 0.5,
                  color: mobileOpen
                    ? theme.palette.text.primary // When drawer is open, use primary text color (light on dark background)
                    : (theme.palette.mode === 'dark' ? theme.palette.text.primary : '#1a1a1a'), // When closed, match the main background
                }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Logo variant={mobileOpen ? 'light' : 'dark'} />
              </Box>
            </Box>
            {/* Actions on mobile - same level as logo */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center' }}>
              <TopbarActions />
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            'display': { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: theme.palette.sidebar.background,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Box>{drawerContent}</Box>
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            'display': { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: theme.palette.sidebar.background,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <BreadcrumbProvider>
        <GlobalTopbarContentProvider>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
              bgcolor: 'background.default',
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {/* Global Topbar */}
            <GlobalTopbar />

            {/* Content with topbar spacing */}
            <Box
              sx={{
                width: '100%',
                maxWidth: 1400,
                mx: 'auto',
                pt: { xs: 8, lg: 0 }, // ~96px mobile, ~72px desktop
              }}
            >
              {children}
            </Box>
          </Box>
        </GlobalTopbarContentProvider>
      </BreadcrumbProvider>
    </Box>
  );
}
