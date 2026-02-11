'use client';

import { useEffect } from 'react';

const CRON_INTERVAL_MS = 60 * 1000; // 1 minute

/**
 * In development only: polls the event-reminder cron endpoint every minute
 * so that calendar reminder notifications are created without needing
 * Vercel's cron or a manual trigger. Does nothing in production.
 */
export function DevCronScheduler() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const tick = () => {
      fetch('/api/cron/check-event-reminders').catch(() => {
        // Ignore errors (e.g. app not ready, network)
      });
    };

    tick();
    const id = setInterval(tick, CRON_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
