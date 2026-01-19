'use client';

import {
  CalendarToday as CalendarTodayIcon,
  Cancel as CancelIcon,
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
import { MotChip } from '@/components/Assets/MotChip';

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
  variant?: 'horizontal' | 'vertical';
};

export function MotTestResultItem({ test, isLatest = false, showDetails = true, variant: _variant = 'horizontal' }: MotTestResultItemProps) {
  const t = useTranslations('Assets');
  const [expanded, setExpanded] = useState(isLatest);

  const isPassed = test.testResult === 'PASSED' || test.testResult === 'PASS';

  const testDate = test.completedDate ? moment(test.completedDate).format('D MMM YYYY') : '-';
  const expiryDate = test.expiryDate ? moment(test.expiryDate).format('YYYY.MM.DD') : null;

  const formattedMileage = test.odometerValue
    ? `${test.odometerValue.toLocaleString()} ${test.odometerUnit || 'mi'}`
    : null;

  const advisories = test.rfrAndComments?.filter(
    item => item.type === 'ADVISORY' || item.type === 'MINOR',
  ) || [];
  const failures = test.rfrAndComments?.filter(
    item => item.type === 'FAIL' || item.type === 'MAJOR' || item.type === 'DANGEROUS' || item.dangerous,
  ) || [];

  return (
    <Box
      sx={{
        py: 2,
        borderBottom: 'none',
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
          cursor: showDetails && (advisories.length > 0 || failures.length > 0) ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (showDetails && (advisories.length > 0 || failures.length > 0)) {
            setExpanded(!expanded);
          }
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
          <MotChip asset={{
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
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'space-between' }}>
            <CalendarTodayIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Test Date:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {testDate}
            </Typography>
          </Box>
          {expiryDate && isPassed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'space-between' }}>
              <CalendarTodayIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Expires:
              </Typography>

              <Typography
                variant="body2"
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
            variant="body2"
            sx={{
              color: 'text.secondary',
              alignSelf: 'flex-start',
            }}
          >
            {formattedMileage}
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
