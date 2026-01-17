'use client';

import type { Asset } from '@/components/Assets/utils';
import { getMotStatus, getStatusColors, getStatusTooltipText } from '@/components/Assets/utils';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Chip, ChipProps, Tooltip, Typography } from '@mui/material';

type MotChipProps = ChipProps & {
  asset: Asset;
  size?: 'small' | 'medium' | 'large';
};

export function MotChip({ asset, size = 'medium', ...props }: MotChipProps) {
  const motStatus = getMotStatus(asset);

  const showIcons = size !== 'small';
  const fontSize = size === 'small' ? '0.625rem' : '0.75rem';
  const height = size === 'small' ? '18px' : '24px';
  const paddingX = size === 'small' ? 1 : 1.5;
  const paddingY = size === 'small' ? 0 : 0.5;

  // Determine status and colors
  const isExpired = motStatus.isExpired;
  const isExpiringSoon = motStatus.isExpiringSoon;
  const colors = getStatusColors(isExpired, isExpiringSoon);

  // Determine icon
  const getIcon = () => {
    if (!showIcons) {
      return null;
    }
    if (isExpired) {
      return <CancelIcon sx={{ color: colors.iconColor, fontSize: 'medium' }} />;
    }
    if (isExpiringSoon) {
      return <WarningIcon sx={{ color: colors.iconColor, fontSize: 'medium' }} />;
    }
    return <CheckIcon sx={{ color: colors.iconColor, fontSize: 'medium' }} />;
  };

  const chip = (
    <Chip
      {...props}
      variant="outlined"
      label={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize,
              color: colors.textColor,
            }}
          >
            MOT
          </Typography>
          {getIcon()}
        </Box>
      )}
      size="small"
      sx={{
        'backgroundColor': colors.backgroundColor,
        'borderRadius': '4px',
        'borderColor': colors.borderColor,
        height,
        '& .MuiChip-label': {
          px: paddingX,
          py: paddingY,
        },
      }}
    />
  );

  const tooltipText = getStatusTooltipText(motStatus.expiryDate, isExpired);
  if (tooltipText) {
    return (
      <Tooltip title={tooltipText}>
        {chip}
      </Tooltip>
    );
  }

  return chip;
}
