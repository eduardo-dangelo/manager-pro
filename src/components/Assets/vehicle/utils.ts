import { toMiles, parseMotTestDate, type MotTest } from '@/components/Assets/utils';

// Type definitions
export type MaintenanceLink = {
  url: string;
  label: string;
  icon?: string;
};

export type MaintenanceItem = {
  expires?: string;
  endsOn?: string;
  links?: MaintenanceLink[];
  lastService?: { date: string; mileage: number };
  nextService?: { date: string; mileage: number };
};

// Re-export MotTest for convenience
export type { MotTest };

export type MileagePoint = {
  label: string;
  value: number;
};


// Check if a maintenance item has data
export function hasMaintenanceData(item: MaintenanceItem): boolean {
  return Boolean(
    item.expires
    || item.endsOn
    || item.lastService
    || item.nextService
    || (item.links && item.links.length > 0),
  );
}

// Build mileage over time series from MOT tests
export function buildMileageOverTimeSeries(motTests: MotTest[]): MileagePoint[] {
  if (!motTests || motTests.length === 0) {
    return [];
  }

  const testsWithMileage = motTests
    .map((test) => {
      const miles = toMiles(test.odometerValue, test.odometerUnit);
      const date = parseMotTestDate(test);
      return miles !== null && date
        ? { date, miles }
        : null;
    })
    .filter((item): item is { date: Date; miles: number } => item !== null);

  if (testsWithMileage.length === 0) {
    return [];
  }

  // Aggregate by year using the maximum recorded mileage for that year
  const yearToMiles = new Map<number, number>();

  testsWithMileage.forEach(({ date, miles }) => {
    const year = date.getFullYear();
    const existing = yearToMiles.get(year);
    if (existing === undefined || miles > existing) {
      yearToMiles.set(year, miles);
    }
  });

  const years = Array.from(yearToMiles.keys()).sort((a, b) => a - b);

  return years.map(year => ({
    label: year.toString(),
    value: yearToMiles.get(year) ?? 0,
  }));
}

// Build mileage per year series from MOT tests
export function buildMileagePerYearSeries(motTests: MotTest[]): MileagePoint[] {
  if (!motTests || motTests.length < 2) {
    return [];
  }

  const testsWithMileage = motTests
    .map((test) => {
      const miles = toMiles(test.odometerValue, test.odometerUnit);
      const date = parseMotTestDate(test);
      return miles !== null && date
        ? { date, miles }
        : null;
    })
    .filter((item): item is { date: Date; miles: number } => item !== null);

  if (testsWithMileage.length < 2) {
    return [];
  }

  // Reuse the yearly aggregation so we compare year-to-year mileage
  const yearToMiles = new Map<number, number>();

  testsWithMileage.forEach(({ date, miles }) => {
    const year = date.getFullYear();
    const existing = yearToMiles.get(year);
    if (existing === undefined || miles > existing) {
      yearToMiles.set(year, miles);
    }
  });

  const years = Array.from(yearToMiles.keys()).sort((a, b) => a - b);

  if (years.length < 2) {
    return [];
  }

  const perYear: MileagePoint[] = [];

  for (let i = 1; i < years.length; i += 1) {
    const prevYear = years[i - 1];
    const currentYear = years[i];
    const prevMiles = yearToMiles.get(prevYear) ?? 0;
    const currentMiles = yearToMiles.get(currentYear) ?? 0;
    const delta = currentMiles - prevMiles;

    if (delta > 0) {
      perYear.push({
        label: currentYear.toString(),
        value: delta,
      });
    }
  }

  return perYear;
}
