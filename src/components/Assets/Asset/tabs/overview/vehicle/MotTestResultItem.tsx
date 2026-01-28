'use client';

import { Box, Chip, Typography } from '@mui/material';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { formatMileage } from '@/components/Assets/utils';

type Defect = {
  text?: string;
  type?: string;
  dangerous?: boolean;
};

type MotTest = {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: number | string;
  odometerUnit?: string;
  odometerResultType?: string;
  motTestNumber?: string;
  defects?: Defect[];
};

type MotTestResultItemProps = {
  test: MotTest;
  isLatest?: boolean;
  showDetails?: boolean;
  showExpiryDate?: boolean;
  variant?: 'horizontal' | 'vertical';
};

export function MotTestResultItem({
  showExpiryDate = false,
  test,
  isLatest: _isLatest = false,
  showDetails = true,
  variant: _variant = 'horizontal',
}: MotTestResultItemProps) {
  const t = useTranslations('Assets');
  const isPassed = test.testResult === 'PASSED' || test.testResult === 'PASS';

  const testDate = test.completedDate ? moment(test.completedDate).format('D MMMM YYYY') : '-';
  const expiryDate = test.expiryDate ? moment(test.expiryDate).format('YYYY.MM.DD') : null;

  const formattedMileage = test.odometerValue
    ? formatMileage(test.odometerValue)
    : null;

  const defects = test.defects ?? [];

  const formatDefectType = (type: string) => {
    switch (type) {
      case 'ADVISORY':
        return 'Advisory';
      case 'FAIL':
      case 'MAJOR':
      case 'DANGEROUS':
        return 'Fail';
    }
  };

  const getChipColor = (type: string) => {
    switch (type) {
      case 'ADVISORY':
        return 'default';
      case 'FAIL':
      case 'MAJOR':
      case 'DANGEROUS':
        return 'error';
    }
  };

  const getChipBackgroundColor = (type: string) => {
    switch (type) {
      case 'ADVISORY':
        return 'rgba(150, 150, 150, 0.1)';
      case 'FAIL':
      case 'MAJOR':
      case 'DANGEROUS':
        return 'rgba(255, 0, 0, 0.05)';
    }
  };

  return (
    <Box
      sx={{
        // py: 2,
        // borderBottom: 'none',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0.5,
            flex: 1,
            // border: '1px solid blue',
          }}
        >
          {/* <MotChip asset={{
            id: 1,
            name: 'Test',
            description: 'Test',
            color: 'red',
            status: 'test',
            type: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              mot: {
                motTests: [test],
              },
            },
          }}
          /> */}
          <Typography variant="h6" sx={{ color: isPassed ? 'success.main' : 'error.main', fontSize: '1rem', fontWeight: 400 }}>
            {test.testResult}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'space-between' }}>
            {/* <CalendarTodayIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} /> */}
            {/* <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Test Date:
            </Typography> */}
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              {testDate}
            </Typography>
          </Box>
          {showExpiryDate && expiryDate && isPassed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'space-between' }}>
              {/* <CalendarTodayIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} /> */}
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Expires:
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {expiryDate}
              </Typography>
            </Box>
          )}
        </Box>
        {formattedMileage && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              alignSelf: 'flex-start',
            }}
          >
            {formattedMileage}
          </Typography>
        )}
      </Box>

      {showDetails && defects.length > 0 && (
        <Box sx={{ mt: 1.5, pl: 0, pt: 1, borderTop: '1px solid #e0e0e0' }}>

          {defects.map((item, index) => (
            <Box
              key={`defect-${item.text?.slice(0, 20) ?? index}`}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.5,
                mb: 0.5,
              }}
            >

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                -
                {' '}
                {item.text}
              </Typography>
              <Chip
                label={formatDefectType(item.type)}
                size="small"
                color={getChipColor(item.type)}
                variant="outlined"
                sx={{
                  height: 16,
                  fontSize: '0.625rem',
                  borderRadius: 1,
                  backgroundColor: getChipBackgroundColor(item.type),
                }}
              />
            </Box>
          ))}
        </Box>
      )}
      {showDetails && !isPassed && defects.length === 0 && (
        <Box sx={{ mt: 1.5, pl: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {t('mot_no_details')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
