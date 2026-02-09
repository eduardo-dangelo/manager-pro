'use client';

import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';

type NotificationsRefetchContextType = {
  refetchNotifications: () => void;
  registerRefetch: (fn: () => void | Promise<void>) => void;
};

const NotificationsRefetchContext = createContext<NotificationsRefetchContextType | undefined>(undefined);

export function NotificationsRefetchProvider({ children }: { children: ReactNode }) {
  const ref = useRef<(() => void | Promise<void>) | null>(null);

  const registerRefetch = useCallback((fn: () => void | Promise<void>) => {
    ref.current = fn;
  }, []);

  const refetchNotifications = useCallback(() => {
    ref.current?.();
  }, []);

  const value: NotificationsRefetchContextType = {
    refetchNotifications,
    registerRefetch,
  };

  return (
    <NotificationsRefetchContext.Provider value={value}>
      {children}
    </NotificationsRefetchContext.Provider>
  );
}

export function useNotificationsRefetch(): NotificationsRefetchContextType {
  const ctx = useContext(NotificationsRefetchContext);
  if (ctx === undefined) {
    return {
      refetchNotifications: () => {},
      registerRefetch: () => {},
    };
  }
  return ctx;
}
