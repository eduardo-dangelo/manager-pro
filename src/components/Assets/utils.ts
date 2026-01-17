import moment from 'moment';

export type Asset = {
  id: number;
  name: string | null;
  description: string;
  color: string;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  registrationNumber?: string | null;
  metadata?: {
    specs?: {
      registration?: string;
      year?: string;
      yearOfManufacture?: string;
      color?: string;
      colour?: string;
      mileage?: string | number;
    };
    maintenance?: {
      mot?: {
        expires?: string;
      };
      tax?: {
        expires?: string;
      };
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
  } | null;
};

// Helper function to format vehicle info string (year, color, mileage)
export function formatVehicleInfo(asset: Asset): string | null {
  if (asset.type !== 'vehicle') {
    return null;
  }

  const metadata = asset.metadata || {};
  const specs = metadata.specs || {};
  const motData = metadata.mot || {};

  const year = specs.year || specs.yearOfManufacture;
  const color = specs.color || specs.colour;

  // Get mileage from latest MOT test first, fallback to specs.mileage
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
    const mileageNum = typeof mileage === 'number' ? mileage : Number.parseFloat(mileage.toString().replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(mileageNum)) {
      parts.push(`${mileageNum.toLocaleString('en-US')}mi`);
    }
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

// Helper function to get MOT status and expiry
export function getMotStatus(asset: Asset): { isValid: boolean; expiryDate: string | null; isExpired: boolean; isExpiringSoon: boolean } {
  if (asset.type !== 'vehicle') {
    return { isValid: false, expiryDate: null, isExpired: false, isExpiringSoon: false };
  }

  const metadata = asset.metadata || {};
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

// Helper function to get TAX status and expiry
export function getTaxStatus(asset: Asset): { isValid: boolean; expiryDate: string | null; isExpired: boolean; isExpiringSoon: boolean } {
  if (asset.type !== 'vehicle') {
    return { isValid: false, expiryDate: null, isExpired: false, isExpiringSoon: false };
  }

  const metadata = asset.metadata || {};
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
    // If no expiry date but status is 'Taxed', consider it valid
    isValid = true;
  }

  return { isValid, expiryDate: taxExpires || null, isExpired, isExpiringSoon };
}

// Helper function to get status colors based on expiry state
export function getStatusColors(isExpired: boolean, isExpiringSoon: boolean): {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
} {
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

// Helper function to get tooltip text for status chips
export function getStatusTooltipText(expiryDate: string | null, isExpired: boolean): string | null {
  if (!expiryDate) {
    return null;
  }

  const formattedDate = moment(expiryDate).format('D MMM YYYY');

  return isExpired
    ? `Expired on ${formattedDate}`
    : `Valid until ${formattedDate}`;
}
