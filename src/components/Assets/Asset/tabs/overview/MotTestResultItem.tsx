'use client';

import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  Typography,
} from '@mui/material';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type RfrComment = {
  text?: string;
  type?: string;
  dangerous?: boolean;
};

type MotTest = {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: number;
  odometerUnit?: string;
  odometerResultType?: string;
  motTestNumber?: string;
  rfrAndComments?: RfrComment[];
};

type MotTestResultItemProps = {
  test: MotTest;
  isLatest?: boolean;
  showDetails?: boolean;
};

export function MotTestResultItem({ test, isLatest = false, showDetails = true }: MotTestResultItemProps) {
  const t = useTranslations('Assets');
  const [expanded, setExpanded] = useState(isLatest);

  const isPassed = test.testResult === 'PASSED' || test.testResult === 'PASS';

  const testDate = test.completedDate ? moment(test.completedDate).format('D MMM YYYY') : '-';
  const expiryDate = test.expiryDate ? moment(test.expiryDate).format('D MMM YYYY') : null;

  const advisories = test.rfrAndComments?.filter(
    item => item.type === 'ADVISORY' || item.type === 'MINOR',
  ) || [];
  const failures = test.rfrAndComments?.filter(
    item => item.type === 'FAIL' || item.type === 'MAJOR' || item.type === 'DANGEROUS' || item.dangerous,
  ) || [];

  return (
    <Box
      sx={{
        'py': 1.5,
        'borderBottom': '1px solid',
        'borderColor': 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: showDetails && (advisories.length > 0 || failures.length > 0) ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (showDetails && (advisories.length > 0 || failures.length > 0)) {
            setExpanded(!expanded);
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={isPassed ? <CheckCircleIcon /> : <CancelIcon />}
            label={isPassed ? t('mot_passed') : t('mot_failed')}
            size="small"
            sx={{
              'backgroundColor': isPassed ? 'success.light' : 'error.light',
              'color': isPassed ? 'success.dark' : 'error.dark',
              'fontWeight': 600,
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {testDate}
          </Typography>
          {test.odometerValue && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {test.odometerValue.toLocaleString()}
              {' '}
              {test.odometerUnit || 'mi'}
            </Typography>
          )}
        </Box>
        {expiryDate && isPassed && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('mot_expires')}
            :
            {' '}
            {expiryDate}
          </Typography>
        )}
      </Box>

      {showDetails && (advisories.length > 0 || failures.length > 0) && (
        <Collapse in={expanded}>
          <Box sx={{ mt: 1.5, pl: 1 }}>
            {failures.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'error.main', fontWeight: 600, display: 'block', mb: 0.5 }}
                >
                  {t('mot_failures')}
                  {' '}
                  (
                  {failures.length}
                  )
                </Typography>
                {failures.map((item, index) => (
                  <Box
                    key={`failure-${item.text?.slice(0, 20) || index}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 14, color: 'error.main', mt: 0.25 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.text}
                      {item.dangerous && (
                        <Chip
                          label="DANGEROUS"
                          size="small"
                          sx={{
                            ml: 1,
                            height: 16,
                            fontSize: '0.625rem',
                            backgroundColor: 'error.dark',
                            color: 'white',
                          }}
                        />
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            {advisories.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'warning.dark', fontWeight: 600, display: 'block', mb: 0.5 }}
                >
                  {t('mot_advisories')}
                  {' '}
                  (
                  {advisories.length}
                  )
                </Typography>
                {advisories.map((item, index) => (
                  <Box
                    key={`advisory-${item.text?.slice(0, 20) || index}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <WarningIcon sx={{ fontSize: 14, color: 'warning.main', mt: 0.25 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
