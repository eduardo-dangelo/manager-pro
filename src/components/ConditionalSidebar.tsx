'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type ConditionalSidebarProps = {
  children: ReactNode;
  sidebarContent: ReactNode;
};

export function ConditionalSidebar({ children, sidebarContent }: ConditionalSidebarProps) {
  const pathname = usePathname();

  // Check if we're on sign-in or sign-up pages
  const isSignInOrSignUp = pathname?.includes('/sign-in') || pathname?.includes('/sign-up');

  if (isSignInOrSignUp) {
    return <>{children}</>;
  }

  return <>{sidebarContent}</>;
}
