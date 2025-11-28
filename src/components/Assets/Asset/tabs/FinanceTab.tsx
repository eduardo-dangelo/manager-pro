'use client';

import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

type Asset = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
};

type FinanceTabProps = {
  asset: Asset;
};

export function FinanceTab({ asset }: FinanceTabProps) {
  const t = useTranslations('Assets');

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
        }}
      >
        <MoneyIcon sx={{ color: 'grey.600' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'grey.800' }}>
          {t('finance_title')}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', color: 'grey.500', py: 8 }}>
        <MoneyIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
        <Typography variant="body1">
          Finance tracking - Coming soon
        </Typography>
      </Box>
    </Box>
  );
}

