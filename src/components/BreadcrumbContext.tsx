'use client';

import type { ReactNode } from 'react';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbContextType = {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<BreadcrumbItem[]>([]);

  const setItems = useCallback((newItems: BreadcrumbItem[]) => {
    setItemsState(newItems);
  }, []);

  const value = useMemo(() => ({ items, setItems }), [items, setItems]);

  return (
    <BreadcrumbContext value={value}>
      {children}
    </BreadcrumbContext>
  );
}

export function useBreadcrumb() {
  const context = use(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}

/**
 * Hook to set breadcrumb items from a page/component.
 * Items will be set on mount/update and cleared on unmount.
 */
export function useSetBreadcrumb(items: BreadcrumbItem[]) {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems(items);

    // Clear breadcrumb on unmount
    return () => {
      setItems([]);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items), setItems]);
}
