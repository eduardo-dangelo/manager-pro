type Asset = {
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
export function getMotStatus(asset: Asset): { isValid: boolean; expiryDate: string | null } {
  if (asset.type !== 'vehicle') {
    return { isValid: false, expiryDate: null };
  }

  const metadata = asset.metadata || {};
  const maintenance = metadata.maintenance || {};
  const motData = metadata.mot || {};

  const latestMotTest = motData.motTests?.[0];
  const motExpires = maintenance.mot?.expires || latestMotTest?.expiryDate || motData.motExpiryDate;

  let isValid = false;
  if (latestMotTest?.testResult === 'PASS') {
    isValid = true;
  } else if (motExpires) {
    isValid = new Date(motExpires) > new Date();
  }

  return { isValid, expiryDate: motExpires || null };
}

// Helper function to get TAX status and expiry
export function getTaxStatus(asset: Asset): { isValid: boolean; expiryDate: string | null } {
  if (asset.type !== 'vehicle') {
    return { isValid: false, expiryDate: null };
  }

  const metadata = asset.metadata || {};
  const maintenance = metadata.maintenance || {};
  const dvlaData = metadata.dvla || {};

  const taxExpires = maintenance.tax?.expires || dvlaData.taxDueDate;
  const taxStatus = dvlaData.taxStatus;

  let isValid = false;
  if (taxStatus === 'Taxed') {
    isValid = true;
  } else if (taxExpires) {
    isValid = new Date(taxExpires) > new Date();
  }

  return { isValid, expiryDate: taxExpires || null };
}
