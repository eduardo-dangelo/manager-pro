'use client';

import type { FC } from 'react';
import { Box, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useHoverSound } from '@/hooks/useHoverSound';

type MileagePoint = {
  label: string;
  value: number;
};

type VehicleMileageChartProps = {
  overTimeData: MileagePoint[];
  perYearData: MileagePoint[];
};

type View = 'over_time' | 'per_year';

export const VehicleMileageChart: FC<VehicleMileageChartProps> = ({
  overTimeData,
  perYearData,
}) => {
  const t = useTranslations('Assets');
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();
  const [view, setView] = useState<View>('over_time');

  const hasPerYearData = perYearData.length > 0;

  const yTickFormatter = (value: number) => {
    if (!Number.isFinite(value)) {
      return '';
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }
    return Math.round(value).toString();
  };

  const sharedChartProps = {
    height: 154,
    margin: { top: -20, right: 0, bottom: -5, left: -15 },
    grid: { horizontal: true, vertical: false },
    slotProps: {
      legend: { hidden: true },
    },
  } as const;

  const content
    = view === 'over_time'
      ? (
          <BarChart
            {...sharedChartProps}
            xAxis={[{
              data: overTimeData.map(point => point.label),
              scaleType: 'band',
            }]}
            borderRadius={4}
            yAxis={[{
              valueFormatter: yTickFormatter,
            }]}
            series={[{
              data: overTimeData.map(point => point.value),
              color: theme.palette.primary.main,
            }]}
            onHighlightChange={(highlightedItem) => {
              if (highlightedItem) playHoverSound();
            }}
          />
        )
      : hasPerYearData
        ? (
            <BarChart
              {...sharedChartProps}
              xAxis={[{
                data: perYearData.map(point => point.label),
                scaleType: 'band',
              }]}
              yAxis={[{
                valueFormatter: yTickFormatter,
              }]}
              borderRadius={4}
              series={[{
                data: perYearData.map(point => point.value),
                color: theme.palette.primary.main,
              }]}
              onHighlightChange={(highlightedItem) => {
                if (highlightedItem) playHoverSound();
              }}
            />
          )
        : (
            <Box
              sx={{
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
                background:
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.01), rgba(0,0,0,0.02))'
                    : 'linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0.04))',
                px: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t('mileage_not_enough_data')}
              </Typography>
            </Box>
          );

  return (
    <Box>

      <Box
        sx={{
          // borderRadius: 2,
          // overflow: 'hidden',
          // backgroundColor:
          //   theme.palette.mode === 'light'
          //     ? 'background.paper'
          //     : 'background.default',
        }}
      >
        {content}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        <Tabs
          value={view}
          onChange={(_, newValue: View) => setView(newValue)}
          variant="standard"
          sx={{
            'minHeight': 22,
            'zIndex': 1,
            '& .MuiTab-root': {
              minHeight: 22,
              textTransform: 'none',
              fontSize: '0.75rem',
              px: 1.5,
            },
          }}
        >
          <Tab
            value="over_time"
            label={t('mileage_over_time')}
          />
          <Tab
            value="per_year"
            label={t('mileage_per_year')}
          />
        </Tabs>
      </Box>

    </Box>
  );
};
