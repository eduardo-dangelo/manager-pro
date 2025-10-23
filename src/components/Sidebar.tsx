'use client';

import type { ReactNode } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import { Logout as LogoutIcon, Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
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
import { useState } from 'react';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (href: string) => {
    return pathname === href;
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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  'borderRadius': 2,
                  'color': active ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  'bgcolor': active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  'pl': item.isSubItem ? 4 : 2,
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
                  <Icon
                    sx={{
                      fontSize: 20,
                      color: '#60a5fa',
                      transition: 'color 0.2s',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
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
          <Box onClick={handleDrawerToggle}>{drawerContent}</Box>
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
