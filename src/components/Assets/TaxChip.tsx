'use client';

import CheckIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Chip, Typography } from '@mui/material';
import { getTaxStatus } from '@/components/Assets/utils';

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

type TaxChipProps = {
  asset: Asset;
  size?: 'small' | 'medium' | 'large';
};

export function TaxChip({ asset, size = 'medium' }: TaxChipProps) {
  const taxStatus = getTaxStatus(asset);

  const showIcons = size !== 'small';
  const fontSize = size === 'small' ? '0.625rem' : '0.75rem';
  const height = size === 'small' ? '18px' : '24px';
  const paddingX = size === 'small' ? 1 : 1.5;
  const paddingY = size === 'small' ? 0 : 0.5;

  return (
    <Chip
      variant="outlined"
      label={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize,
              color: taxStatus.isValid ? 'success.dark' : 'warning.dark',
            }}
          >
            TAX
          </Typography>
          {showIcons && taxStatus.isValid && (
            <CheckIcon sx={{ color: 'success.main', fontSize: 'medium' }} />
          )}
          {showIcons && !taxStatus.isValid && (
            <WarningIcon sx={{ color: 'warning.main', fontSize: 'medium' }} />
          )}
        </Box>
      )}
      size="small"
      sx={{
        'backgroundColor': taxStatus.isValid ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)',
        'borderRadius': '4px',
        'borderColor': taxStatus.isValid ? 'success.main' : 'warning.main',
        height,
        '& .MuiChip-label': {
          px: paddingX,
          py: paddingY,
        },
      }}
    />
  );
}
