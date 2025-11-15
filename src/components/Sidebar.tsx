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
import { Logo } from './Logo';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const pathname = usePathname();

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

    // Exact match
    if (pathnameWithoutLocale === hrefWithoutLocale) {
      return true;
    }

    // For sub-routes, only highlight the most specific matching route
    // This prevents multiple parent routes from being highlighted
    if (pathnameWithoutLocale.startsWith(`${hrefWithoutLocale}/`)) {
      // Check if there's a more specific route in the menu that also matches
      // If we're on /projects/vehicles/123, we want to highlight /projects/vehicles, not /projects
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

          return (
            <Box key={parent.href}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={parent.href}
                  onClick={(e) => {
                    // e.stopPropagation();
                    toggleExpanded(parent.href);
                  }}
                  sx={{
                    'borderRadius': 2,
                    'color': active || hasActiveChild ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    'bgcolor': active || hasActiveChild ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    'pl': 2,
                    'pr': hasChildren ? 0.5 : 2,
                    '&:hover': {
                      'bgcolor': 'rgba(255, 255, 255, 0.12)',
                      'color': 'white',
                      '& .MuiListItemIcon-root': {
                        color: '#60a5fa',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon
                      sx={{
                        fontSize: 20,
                        color: '#60a5fa',
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
                  {hasChildren && (
                    <IconButton
                      size="small"
                      sx={{
                        'color': 'rgba(255, 255, 255, 0.7)',
                        'p': 0.5,
                        'mr': 0.5,
                        'transition': 'transform 0.2s, color 0.2s',
                        'transform': isExpanded || hasActiveChild ? 'rotate(90deg)' : 'rotate(0deg)',
                        '&:hover': {
                          color: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      <ChevronRight sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
                </ListItemButton>
              </ListItem>
              {hasChildren && (
                <Collapse in={isExpanded || hasActiveChild} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);
                      return (
                        <ListItem key={child.href} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            component={Link}
                            href={child.href}
                            sx={{
                              'borderRadius': 2,
                              'color': childActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                              'bgcolor': childActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                              'pl': 4,
                              '&:hover': {
                                'bgcolor': 'rgba(255, 255, 255, 0.12)',
                                'color': 'white',
                                '& .MuiListItemIcon-root': {
                                  color: '#60a5fa',
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <ChildIcon
                                sx={{
                                  fontSize: 20,
                                  color: '#60a5fa',
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
            <SignOutButton>
              <ListItemButton
                sx={{
                  'borderRadius': 2,
                  'color': 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    'bgcolor': 'rgba(255, 255, 255, 0.08)',
                    'color': 'white',
                    '& .MuiListItemIcon-root': {
                      color: '#60a5fa',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon
                    sx={{
                      fontSize: 20,
                      color: '#60a5fa',
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
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8f9fa', overflow: 'hidden' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: 'transparent',
            display: { xs: 'block', lg: 'none' },
            zIndex: theme => theme.zIndex.drawer + 1,
            transition: 'background-color 0.3s ease',
          }}
        >
          <Toolbar>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 0.5,
                color: mobileOpen ? 'white' : 'grey.900',
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Logo variant={mobileOpen ? 'light' : 'dark'} />
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
              bgcolor: '#1e293b',
              borderRight: 'none',
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
              bgcolor: '#1e293b',
              borderRight: 'none',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          bgcolor: '#f8f9fa',
          pt: { xs: 9, lg: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1400,
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
