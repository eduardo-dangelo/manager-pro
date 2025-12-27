'use client';

import type { ReactNode } from 'react';
import { createContext, use, useCallback, useState, useMemo } from 'react';

type GlobalTopbarContentContextType = {
  rightContent: ReactNode | null;
  setRightContent: (content: ReactNode | null) => void;
};

const GlobalTopbarContentContext = createContext<GlobalTopbarContentContextType | undefined>(undefined);

export function GlobalTopbarContentProvider({ children }: { children: ReactNode }) {
  const [rightContent, setRightContentState] = useState<ReactNode | null>(null);

  const setRightContent = useCallback((content: ReactNode | null) => {
    setRightContentState(content);
  }, []);

  const value = useMemo(() => ({ rightContent, setRightContent }), [rightContent, setRightContent]);

  return (
    <GlobalTopbarContentContext value={value}>
      {children}
    </GlobalTopbarContentContext>
  );
}

export function useGlobalTopbarContent() {
  const context = use(GlobalTopbarContentContext);
  if (context === undefined) {
    throw new Error('useGlobalTopbarContent must be used within a GlobalTopbarContentProvider');
  }
  return context;
}

