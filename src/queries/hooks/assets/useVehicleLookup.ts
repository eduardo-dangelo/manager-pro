'use client';

import { useMutation } from '@tanstack/react-query';
import { assetKeys } from '@/queries/keys';

export type VehicleLookupResult = {
  vehicle: Record<string, unknown>;
  dvla: unknown;
  mot: unknown;
};

export function useVehicleLookup(locale: string) {
  return useMutation({
    mutationKey: assetKeys.vehicle.lookup(''),
    mutationFn: async (registration: string) => {
      const res = await fetch(`/${locale}/api/vehicles/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: registration.trim().toUpperCase().replace(/\s+/g, '') }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.details || 'Failed to lookup vehicle');
      }
      return (await res.json()) as VehicleLookupResult;
    },
  });
}
