import moment from 'moment';

export type AssetMetadata = {
  specs?: {
    registration?: string;
    year?: string;
    yearOfManufacture?: string;
    color?: string;
    colour?: string;
    mileage?: string | number;
  };
  maintenance?: {
    mot?: { expires?: string };
    tax?: { expires?: string };
  };
  mot?: {
    motTests?: Array<{
      testResult?: string;
      expiryDate?: string;
      odometerValue?: number;
      odometerUnit?: string;
    }>;
    motExpiryDate?: string;
  };
  dvla?: {
    taxStatus?: string;
    taxDueDate?: string;
  };
};

export type AssetData = {
  id: number;
  name: string | null;
  description: string | null;
  color: string | null;
  status: string | null;
  type: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  registrationNumber?: string | null;
  metadata?: AssetMetadata | null;
  tabs?: string[];
  // Relations when fetched with getAssetWithRelations
  objectives?: unknown[];
  todos?: unknown[];
  sprints?: unknown[];
};

export type MotTest = {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: number | string;
  odometerUnit?: string;
  odometerResultType?: string;
  motTestNumber?: string;
  defects?: Array<{ text?: string; type?: string; dangerous?: boolean }>;
};

export type MileagePoint = {
  label: string;
  value: number;
};

export type MaintenanceItem = {
  expires?: string;
  endsOn?: string;
  links?: Array<{ url: string; label: string; icon?: string }>;
  lastService?: { date: string; mileage: number };
  nextService?: { date: string; mileage: number };
};

export type MotTaxStatus = {
  isValid: boolean;
  expiryDate: string | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
};

export type StatusColors = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
};

const PLURAL_MAP: Record<string, string> = {
  vehicle: 'vehicles',
  property: 'properties',
  person: 'persons',
  project: 'projects',
  trip: 'trips',
  custom: 'customs',
};

const KM_TO_MILES = 0.621371;

export class Asset {
  constructor(public readonly data: AssetData) {}

  static fromApi(raw: AssetData): Asset {
    return new Asset(raw);
  }

  get id(): number {
    return this.data.id;
  }

  get type(): string {
    return this.data.type;
  }

  get name(): string | null {
    return this.data.name;
  }

  get description(): string | null {
    return this.data.description;
  }

  get color(): string {
    return this.data.color ?? '';
  }

  get status(): string {
    return this.data.status ?? '';
  }

  get createdAt(): Date | string {
    return this.data.createdAt;
  }

  get updatedAt(): Date | string {
    return this.data.updatedAt;
  }

  get registrationNumber(): string | null | undefined {
    return this.data.registrationNumber;
  }

  get metadata(): AssetMetadata | null | undefined {
    return this.data.metadata;
  }

  get tabs(): string[] | undefined {
    return this.data.tabs;
  }

  get objectives(): unknown[] | undefined {
    return this.data.objectives;
  }

  get todos(): unknown[] | undefined {
    return this.data.todos;
  }

  get sprints(): unknown[] | undefined {
    return this.data.sprints;
  }

  getPluralizedRoute(): string {
    return PLURAL_MAP[this.data.type] || `${this.data.type}s`;
  }

  formatVehicleInfo(): string | null {
    if (this.data.type !== 'vehicle') {
      return null;
    }

    const metadata = this.data.metadata || {};
    const specs = metadata.specs || {};
    const motData = metadata.mot || {};

    const year = specs.year || specs.yearOfManufacture;
    const color = specs.color || specs.colour;

    const latestMotTest = motData.motTests?.[0];
    const mileageFromMot = latestMotTest?.odometerValue;
    const mileage = mileageFromMot ?? specs.mileage;

    const parts: string[] = [];

    if (year) {
      parts.push(year.toString());
    }
    if (color) {
      parts.push(color.toString());
    }
    if (mileage) {
      const mileageNum = typeof mileage === 'number'
        ? mileage
        : Number.parseFloat(mileage.toString().replace(/[^0-9.]/g, ''));
      if (!Number.isNaN(mileageNum)) {
        parts.push(`${mileageNum.toLocaleString('en-US')}mi`);
      }
    }

    return parts.length > 0 ? parts.join(' · ') : null;
  }

  getMotStatus(): MotTaxStatus {
    if (this.data.type !== 'vehicle') {
      return { isValid: false, expiryDate: null, isExpired: false, isExpiringSoon: false };
    }

    const metadata = this.data.metadata || {};
    const maintenance = metadata.maintenance || {};
    const motData = metadata.mot || {};

    const latestMotTest = motData.motTests?.[0];
    const motExpires = maintenance.mot?.expires || latestMotTest?.expiryDate || motData.motExpiryDate;

    let isValid = false;
    let isExpired = false;
    let isExpiringSoon = false;

    if (latestMotTest?.testResult === 'PASS') {
      isValid = true;
    } else if (motExpires) {
      const expiryDate = new Date(motExpires);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      isExpired = expiryDate < now;
      isExpiringSoon = !isExpired && daysUntilExpiry <= 30;
      isValid = !isExpired && daysUntilExpiry > 30;
    }

    return { isValid, expiryDate: motExpires || null, isExpired, isExpiringSoon };
  }

  getTaxStatus(): MotTaxStatus {
    if (this.data.type !== 'vehicle') {
      return { isValid: false, expiryDate: null, isExpired: false, isExpiringSoon: false };
    }

    const metadata = this.data.metadata || {};
    const maintenance = metadata.maintenance || {};
    const dvlaData = metadata.dvla || {};

    const taxExpires = maintenance.tax?.expires || dvlaData.taxDueDate;
    const taxStatus = dvlaData.taxStatus;

    let isValid = false;
    let isExpired = false;
    let isExpiringSoon = false;

    if (taxExpires) {
      const expiryDate = new Date(taxExpires);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      isExpired = expiryDate < now;
      isExpiringSoon = !isExpired && daysUntilExpiry <= 30;
      isValid = !isExpired && daysUntilExpiry > 30;
    } else if (taxStatus === 'Taxed') {
      isValid = true;
    }

    return { isValid, expiryDate: taxExpires || null, isExpired, isExpiringSoon };
  }

  static formatEngineSize(value: string | number | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const num = typeof value === 'number' ? value : Number.parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    if (Number.isNaN(num)) {
      return null;
    }

    if (num < 950) {
      return `${Math.round(num)}cc`;
    }

    let liters = num;
    if (num >= 950 && (num > 100 || (num % 1) === 0)) {
      liters = num / 1000;
    }

    const rounded = Math.round(liters * 10) / 10;
    return `${rounded}L`;
  }

  static formatMileage(value: string | number | null | undefined): string | null {
    if (!value) {
      return null;
    }
    if (typeof value === 'number') {
      return `${value.toLocaleString('en-US')} mi`;
    }
    const num = Number.parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(num)) {
      return `${num.toLocaleString('en-US')} mi`;
    }
    return `${value} mi`;
  }

  static getStatusColors(isExpired: boolean, isExpiringSoon: boolean): StatusColors {
    if (isExpired) {
      return {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderColor: 'error.main',
        textColor: 'error.dark',
        iconColor: 'error.main',
      };
    }
    if (isExpiringSoon) {
      return {
        backgroundColor: 'rgba(255, 255, 0, 0.1)',
        borderColor: 'warning.main',
        textColor: 'warning.dark',
        iconColor: 'warning.main',
      };
    }
    return {
      backgroundColor: 'rgba(0, 255, 0, 0.1)',
      borderColor: 'success.main',
      textColor: 'success.dark',
      iconColor: 'success.main',
    };
  }

  static getStatusTooltipText(expiryDate: string | null, isExpired: boolean): string | null {
    if (!expiryDate) {
      return null;
    }
    const formattedDate = moment(expiryDate).format('D MMM YYYY');
    return isExpired ? `Expired on ${formattedDate}` : `Valid until ${formattedDate}`;
  }

  static toMiles(value?: number | string, unit?: string): number | null {
    if (value === undefined || value === null) {
      return null;
    }
    const numericValue = typeof value === 'number'
      ? value
      : Number.parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    if (Number.isNaN(numericValue)) {
      return null;
    }
    const normalizedUnit = unit?.toLowerCase() ?? 'mi';
    if (normalizedUnit.includes('km')) {
      return numericValue * KM_TO_MILES;
    }
    return numericValue;
  }

  static parseMotTestDate(test: MotTest): Date | null {
    const dateStr = test.completedDate || test.expiryDate;
    if (!dateStr) {
      return null;
    }
    const m = moment(dateStr);
    return m.isValid() ? m.toDate() : null;
  }

  static formatDate(dateStr: string | undefined): string {
    if (!dateStr) {
      return '-';
    }
    return moment(dateStr).format('D MMM YYYY');
  }

  static hasMaintenanceData(item: MaintenanceItem): boolean {
    return Boolean(
      item.expires
      || item.endsOn
      || item.lastService
      || item.nextService
      || (item.links && item.links.length > 0),
    );
  }

  static getUniqueNewFolderName(existingNames: string[], baseName: string): string {
    const namesSet = new Set(existingNames.map(n => n.toLowerCase()));
    if (!namesSet.has(baseName.toLowerCase())) {
      return baseName;
    }
    let n = 1;
    while (namesSet.has(`${baseName} (${n})`.toLowerCase())) {
      n++;
    }
    return `${baseName} (${n})`;
  }

  static buildMileageOverTimeSeries(motTests: MotTest[]): MileagePoint[] {
    if (!motTests || motTests.length === 0) {
      return [];
    }

    const testsWithMileage = motTests
      .map((test) => {
        const miles = Asset.toMiles(test.odometerValue, test.odometerUnit);
        const date = Asset.parseMotTestDate(test);
        return miles !== null && date ? { date, miles } : null;
      })
      .filter((item): item is { date: Date; miles: number } => item !== null);

    if (testsWithMileage.length === 0) {
      return [];
    }

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

  static buildMileagePerYearSeries(motTests: MotTest[]): MileagePoint[] {
    if (!motTests || motTests.length < 2) {
      return [];
    }

    const testsWithMileage = motTests
      .map((test) => {
        const miles = Asset.toMiles(test.odometerValue, test.odometerUnit);
        const date = Asset.parseMotTestDate(test);
        return miles !== null && date ? { date, miles } : null;
      })
      .filter((item): item is { date: Date; miles: number } => item !== null);

    if (testsWithMileage.length < 2) {
      return [];
    }

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
      if (prevYear === undefined || currentYear === undefined) {
        continue;
      }
      const prevMiles = yearToMiles.get(prevYear) ?? 0;
      const currentMiles = yearToMiles.get(currentYear) ?? 0;
      const delta = currentMiles - prevMiles;
      if (delta > 0) {
        perYear.push({ label: currentYear.toString(), value: delta });
      }
    }
    return perYear;
  }
}
