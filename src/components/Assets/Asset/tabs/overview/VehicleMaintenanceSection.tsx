'use client';

import type { SxProps, Theme } from '@mui/material';
import type { ReactElement, ReactNode } from 'react';
import {
  Add as AddIcon,
  AutorenewOutlined as AutorenewOutlinedIcon,
  CalendarTodayOutlined as CalendarIconOutlined,
  Cancel as CancelIcon,
  Check as CheckIcon,
  History as HistoryIcon,
  OpenInNew as OpenInNewIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { MotTestResultItem } from '@/components/Assets/Asset/tabs/overview/MotTestResultItem';
import { VehicleMileageChart } from '@/components/Assets/Asset/tabs/overview/VehicleMileageChart';
import { getStatusColors } from '@/components/Assets/utils';
import { Card } from '@/components/common/Card';

type Asset = {
  id: number;
  name: string;
  type?: string | null;
  metadata?: Record<string, any>;
  objectives?: any[];
  todos?: any[];
  sprints?: any[];
};

type VehicleMaintenanceSectionProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

type MaintenanceLink = {
  url: string;
  label: string;
  icon?: string;
};

type MaintenanceItem = {
  expires?: string;
  endsOn?: string;
  links?: MaintenanceLink[];
  lastService?: { date: string; mileage: number };
  nextService?: { date: string; mileage: number };
};

type MotTest = {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: number | string;
  odometerUnit?: string;
  odometerResultType?: string;
  motTestNumber?: string;
  rfrAndComments?: Array<{
    text?: string;
    type?: string;
    dangerous?: boolean;
  }>;
};

type MileagePoint = {
  label: string;
  value: number;
};

const KM_TO_MILES = 0.621371;

const toMiles = (value?: number | string, unit?: string): number | null => {
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
};

const parseMotTestDate = (test: MotTest): Date | null => {
  const dateStr = test.completedDate || test.expiryDate;
  if (!dateStr) {
    return null;
  }

  const m = moment(dateStr);
  return m.isValid() ? m.toDate() : null;
};

const buildMileageOverTimeSeries = (motTests: MotTest[]): MileagePoint[] => {
  if (!motTests || motTests.length === 0) {
    return [];
  }

  const testsWithMileage = motTests
    .map((test) => {
      const miles = toMiles(test.odometerValue, test.odometerUnit);
      const date = parseMotTestDate(test);
      return miles !== null && date
        ? { date, miles }
        : null;
    })
    .filter((item): item is { date: Date; miles: number } => item !== null);

  if (testsWithMileage.length === 0) {
    return [];
  }

  // Aggregate by year using the maximum recorded mileage for that year
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
};

const buildMileagePerYearSeries = (motTests: MotTest[]): MileagePoint[] => {
  if (!motTests || motTests.length < 2) {
    return [];
  }

  const testsWithMileage = motTests
    .map((test) => {
      const miles = toMiles(test.odometerValue, test.odometerUnit);
      const date = parseMotTestDate(test);
      return miles !== null && date
        ? { date, miles }
        : null;
    })
    .filter((item): item is { date: Date; miles: number } => item !== null);

  if (testsWithMileage.length < 2) {
    return [];
  }

  // Reuse the yearly aggregation so we compare year-to-year mileage
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
    const prevMiles = yearToMiles.get(prevYear) ?? 0;
    const currentMiles = yearToMiles.get(currentYear) ?? 0;
    const delta = currentMiles - prevMiles;

    if (delta > 0) {
      perYear.push({
        label: currentYear.toString(),
        value: delta,
      });
    }
  }

  return perYear;
};

// Type definitions for array-based structure
type MaintenanceSectionItem = {
  label: string;
  icon?: ReactElement;
  value: ReactNode;
  customSx?: (value: any) => SxProps<Theme>;
  renderCustom?: () => ReactNode;
  tooltip?: string;
  onClick?: () => void;
  valueIcon?: ReactElement;
};

type MaintenanceCardConfig = {
  id: string;
  titleKey: string;
  hasData: () => boolean;
  sections: MaintenanceSectionItem[];
};

type MaintenanceSectionItemProps = {
  label: string;
  icon?: ReactElement;
  value: ReactNode;
  customSx?: SxProps<Theme>;
  valueIcon?: ReactElement;
  tooltip?: string;
  onClick?: () => void;
};

// Reusable component for rendering maintenance section items
function MaintenanceSectionItemComponent({
  label,
  icon,
  value,
  customSx,
  valueIcon,
  tooltip,
  onClick,
}: MaintenanceSectionItemProps) {
  const defaultSx: SxProps<Theme> = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    p: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(onClick ? { 'cursor': 'pointer', '&:hover': { backgroundColor: 'action.hover' } } : {}),
  };

  const mergedSx: SxProps<Theme> = customSx ? { ...defaultSx, ...customSx } : defaultSx;

  // Extract color from customSx if it exists
  const getColorFromSx = (sx?: SxProps<Theme>): string | undefined => {
    if (!sx || typeof sx !== 'object') {
      return undefined;
    }
    if ('color' in sx && typeof sx.color === 'string') {
      return sx.color as string;
    }
    return undefined;
  };

  const customColor = getColorFromSx(customSx);

  const content = (
    <Box sx={mergedSx} onClick={onClick}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon && (
          <Box sx={{ fontSize: '1.075rem', color: customColor || 'text.secondary' }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" sx={{ color: customColor || 'text.primary', mb: 0 }}>
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" sx={{ color: customColor || 'text.primary', mb: 0, fontWeight: 600 }}>
          {value}
        </Typography>
        {valueIcon}
      </Box>
    </Box>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{content}</Tooltip>;
  }

  return content;
}

// Format date using moment
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) {
    return '-';
  }
  return moment(dateStr).format('D MMM YYYY');
};

// Check if a maintenance item has data
const hasMaintenanceData = (item: MaintenanceItem) => {
  return item.expires || item.endsOn || item.lastService || item.nextService || (item.links && item.links.length > 0);
};

// Build maintenance cards array based on asset data
const buildMaintenanceCards = (
  metadata: Record<string, any>,
  maintenance: Record<string, any>,
  _motData: Record<string, any>,
  motTests: MotTest[],
  latestMotTest: MotTest | null,
  t: ReturnType<typeof useTranslations<'Assets'>>,
  setMotHistoryOpen: (open: boolean) => void,
): MaintenanceCardConfig[] => {
  const mot: MaintenanceItem = maintenance.mot || {};
  const tax: MaintenanceItem = maintenance.tax || {};
  const insurance: MaintenanceItem = maintenance.insurance || {};
  const finance: MaintenanceItem = maintenance.finance || {};
  const service: MaintenanceItem = maintenance.service || {};
  const dvlaData = metadata.dvla || {};

  const hasMotData = Boolean(latestMotTest || mot.expires);
  const hasTaxData = Boolean(tax.expires || dvlaData.taxStatus || dvlaData.taxDueDate);
  const taxExpiry = tax.expires || dvlaData.taxDueDate;
  const taxStatus = dvlaData.taxStatus;

  const cards: MaintenanceCardConfig[] = [];

  const mileageOverTimeSeries = buildMileageOverTimeSeries(motTests);
  const mileagePerYearSeries = buildMileagePerYearSeries(motTests);
  const hasMileageData = mileageOverTimeSeries.length > 0;

  const getIcon = (isExpired: boolean, isExpiringSoon: boolean): ReactElement => {
    if (isExpired) {
      return <CancelIcon fontSize="small" sx={{ color: 'error.main' }} />;
    }
    if (isExpiringSoon) {
      return <WarningIcon fontSize="small" sx={{ color: 'warning.main' }} />;
    }
    return <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />;
  };

  // MOT Card
  const motExpiryDate = latestMotTest?.expiryDate;
  const motRemainingDays = motExpiryDate ? Math.max(0, moment(motExpiryDate).diff(moment(), 'days')) : null;
  const motIsExpiringSoon = motRemainingDays !== null && motRemainingDays <= 30;
  const motTestResult = latestMotTest?.testResult;
  const motIsValid = motTestResult === 'PASSED' || motTestResult === 'PASS';
  const motIsInvalid = motTestResult === 'FAILED' || motTestResult === 'FAIL';

  cards.push({
    id: 'mot',
    titleKey: 'mot',
    hasData: () => hasMotData,
    sections: latestMotTest
      ? [
          {
            label: 'Mot Status',
            icon: <AutorenewOutlinedIcon />,
            value: motIsValid ? 'Valid' : motIsInvalid ? 'Invalid' : motTestResult || '-',
            valueIcon: getIcon(motIsInvalid, false),
            tooltip: motIsExpiringSoon && motRemainingDays !== null
              ? `Expiring soon`
              : undefined,
            customSx: () => {
              const color = getStatusColors(motIsInvalid, false);
              return ({
                border: '1px solid',
                borderColor: color.borderColor,
                backgroundColor: color.backgroundColor,
                elevation: 5,
                color: color.textColor,
              });
            },
          },
          {
            label: 'Expires',
            icon: <CalendarIconOutlined />,
            value: formatDate(motExpiryDate),
          },
          {
            label: 'Remaining days',
            icon: <HistoryIcon />,
            value: motRemainingDays !== null ? motRemainingDays : '-',
          },
          ...(motTests.length > 1
            ? [
                {
                  label: t('view_mot_history'),
                  icon: <HistoryIcon />,
                  value: '',
                  onClick: () => setMotHistoryOpen(true),
                },
              ]
            : []),
        ]
      : [],
  });

  // Tax Card
  const taxRemainingDays = taxExpiry ? Math.max(0, moment(taxExpiry).diff(moment(), 'days')) : null;
  const taxIsExpiringSoon = taxRemainingDays !== null && taxRemainingDays <= 30;
  const taxIsExpired = taxStatus !== 'Taxed';

  cards.push({
    id: 'tax',
    titleKey: 'tax',
    hasData: () => hasTaxData,
    sections: taxExpiry
      ? [
          ...(taxStatus
            ? [
                {
                  label: 'Tax Status',
                  icon: <AutorenewOutlinedIcon />,
                  value: taxStatus,
                  valueIcon: getIcon(taxIsExpired, taxIsExpiringSoon),
                  tooltip: taxIsExpiringSoon && taxRemainingDays !== null
                    ? `Expiring soon`
                    : undefined,
                  customSx: () => {
                    const color = getStatusColors(taxIsExpired, taxIsExpiringSoon);
                    return ({
                      border: '1px solid',
                      borderColor: color.borderColor,
                      backgroundColor: color.backgroundColor,
                      elevation: 5,
                      color: color.textColor,
                    });
                  },
                },
              ]
            : []),
          {
            label: t('expires'),
            icon: <CalendarIconOutlined />,
            value: formatDate(taxExpiry),
          },
          {
            label: 'Remaining days',
            icon: <HistoryIcon />,
            value: taxRemainingDays !== null ? taxRemainingDays : '-',
          },
          {
            label: t('tax_your_vehicle'),
            icon: <OpenInNewIcon />,
            value: '',
            onClick: () => {
              window.open('https://www.gov.uk/vehicle-tax', '_blank', 'noopener,noreferrer');
            },
          },
        ]
      : [],
  });

  // Mileage Card (between Tax and Insurance)
  cards.push({
    id: 'mileage',
    titleKey: 'mileage',
    hasData: () => hasMileageData,
    sections: hasMileageData
      ? [
          {
            label: '',
            value: '',
            renderCustom: () => (
              <VehicleMileageChart
                overTimeData={mileageOverTimeSeries}
                perYearData={mileagePerYearSeries}
              />
            ),
          },
        ]
      : [],
  });

  // // Insurance Card
  // cards.push({
  //   id: 'insurance',
  //   titleKey: 'insurance',
  //   hasData: () => Boolean(hasMaintenanceData(insurance)),
  //   sections: insurance.expires
  //     ? [
  //         {
  //           label: t('expires'),
  //           icon: <CalendarIconOutlined />,
  //           value: formatDate(insurance.expires),
  //         },
  //       ]
  //     : [],
  //   // Insurance links will be handled separately in render
  // });

  // // Finance Card
  // cards.push({
  //   id: 'finance',
  //   titleKey: 'finance_agreement',
  //   hasData: () => Boolean(hasMaintenanceData(finance)),
  //   sections: finance.endsOn || finance.expires
  //     ? [
  //         {
  //           label: t('ends_on'),
  //           icon: <CalendarIconOutlined />,
  //           value: formatDate(finance.endsOn || finance.expires),
  //         },
  //       ]
  //     : [],
  // });

  // // Service Card
  // cards.push({
  //   id: 'service',
  //   titleKey: 'service',
  //   hasData: () => Boolean(hasMaintenanceData(service)),
  //   sections: [
  //     ...(service.lastService
  //       ? [
  //           {
  //             label: t('last_service'),
  //             value: `${formatDate(service.lastService.date)} - ${service.lastService.mileage.toLocaleString()} ${t('miles')}`,
  //           },
  //         ]
  //       : []),
  //     ...(service.nextService
  //       ? [
  //           {
  //             label: t('next_service'),
  //             value: `${formatDate(service.nextService.date)} - ${service.nextService.mileage.toLocaleString()} ${t('miles')}`,
  //           },
  //         ]
  //       : []),
  // ],
  // });

  return cards;
};

export function VehicleMaintenanceSection({
  asset,
  locale: _locale,
  onUpdateAsset: _onUpdateAsset,
}: VehicleMaintenanceSectionProps) {
  const t = useTranslations('Assets');
  const [motHistoryOpen, setMotHistoryOpen] = useState(false);

  const metadata = asset.metadata || {};
  const maintenance = metadata.maintenance || {};
  const motData = metadata.mot || {};

  // Get MOT tests from the stored MOT data
  const motTests: MotTest[] = motData.motTests || [];
  const latestMotTest = motTests.length > 0 ? motTests[0] : null;

  // Build maintenance cards array
  const maintenanceCards = buildMaintenanceCards(
    metadata,
    maintenance,
    motData,
    motTests,
    latestMotTest ?? null,
    t,
    setMotHistoryOpen,
  );

  // Extract data for custom rendering needs
  const insurance: MaintenanceItem = maintenance.insurance || {};
  const finance: MaintenanceItem = maintenance.finance || {};

  const cardSx = {
    width: { xs: '100%' },
    minHeight: 120,
    position: 'relative',
  };

  const emptyStateBoxSx = {
    'flex': 1,
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'm': 1.5,
    'mt': 0,
    'border': '1px dashed',
    'borderColor': 'divider',
    'borderRadius': 1,
    'cursor': 'pointer',
    'transition': 'all 0.2s ease',
    '&:hover': {
      borderColor: 'primary.main',
      backgroundColor: 'action.hover',
    },
  };

  const titleSx = {
    fontWeight: 500,
    mb: 1,
    textTransform: 'titlecase' as const,
  };

  return (
    <Box sx={{ m: -1 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {maintenanceCards.map((card) => {
          const hasData = card.hasData();
          const titleVariant = 'h6';

          return (
            <Box key={card.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1 }}>
              <Card
                key={card.id}
                sx={{
                  ...cardSx,
                  ...(hasData
                    ? { px: 2, py: 1.5 }
                    : { display: 'flex', flexDirection: 'column' }),
                  ...(card.id === 'insurance' && hasData ? { pl: 2 } : {}),
                }}
              >
                {/* Header with title and actions */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: hasData ? 1 : 0,
                  }}
                >
                  <Typography
                    variant={titleVariant}
                    sx={{
                      ...titleSx,
                      ...(!hasData ? { px: 2, pt: 1.5 } : {}),
                      ...(card.id !== 'mot' && !hasData ? {} : {}),
                    }}
                  >
                    {/* {capitalizeTitle(t(card.titleKey as any))} */}
                    {t(card.titleKey as any)}

                    {!hasData && ':'}
                  </Typography>
                </Box>

                {/* Content */}
                {hasData
                  ? (
                      <Box>
                        {card.sections.length > 0 && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {card.sections.map((section, sectionIndex) => {
                              if (section.renderCustom) {
                                return <Box key={`${card.id}-section-${sectionIndex}`}>{section.renderCustom()}</Box>;
                              }

                              if (!section.label && !section.value) {
                                return null;
                              }

                              const customSx = section.customSx
                                ? section.customSx(section.value)
                                : undefined;

                              // For service sections, render without icon boxes
                              if (card.id === 'service') {
                                return (
                                  <Typography
                                    key={`${card.id}-service-${sectionIndex}`}
                                    variant="body2"
                                    sx={{
                                      color: 'text.primary',
                                      mb: sectionIndex < card.sections.length - 1 ? 0.5 : 0,
                                    }}
                                  >
                                    {section.label}
                                    :
                                    {' '}
                                    {section.value}
                                  </Typography>
                                );
                              }

                              // For insurance/finance with just text (no icon), render as simple text
                              if (card.id === 'insurance' && sectionIndex === 0 && !section.icon) {
                                return (
                                  <Typography
                                    key={`${card.id}-insurance-${sectionIndex}`}
                                    variant="body2"
                                    sx={{ color: 'text.primary', mb: 1 }}
                                  >
                                    {section.label}
                                    :
                                    {' '}
                                    {section.value}
                                  </Typography>
                                );
                              }

                              if (card.id === 'finance' && sectionIndex === 0 && !section.icon) {
                                return (
                                  <Typography
                                    key={`${card.id}-finance-${sectionIndex}`}
                                    variant="body2"
                                    sx={{ color: 'text.primary', mb: 1 }}
                                  >
                                    {section.label}
                                    :
                                    {' '}
                                    {section.value}
                                  </Typography>
                                );
                              }

                              // Render action buttons (sections with onClick and empty/no value) as primary buttons
                              if (section.onClick && (!section.value || section.value === '')) {
                                return (
                                  <Button
                                    key={`${card.id}-action-${sectionIndex}`}
                                    variant="outlined"
                                    color="primary"
                                    onClick={section.onClick}
                                    startIcon={section.icon}
                                    fullWidth
                                    sx={{
                                      // mt: 1,
                                      // boxShadow: 4,
                                      // elevation: 4,
                                      // py: 1.5,
                                      textTransform: 'none',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {section.label}
                                  </Button>
                                );
                              }

                              return (
                                <MaintenanceSectionItemComponent
                                  key={`${card.id}-item-${sectionIndex}`}
                                  label={section.label}
                                  icon={section.icon}
                                  value={section.value}
                                  customSx={customSx}
                                  valueIcon={section.valueIcon}
                                  tooltip={section.tooltip}
                                  onClick={section.onClick}
                                />
                              );
                            })}
                          </Box>
                        )}

                        {/* Insurance links */}
                        {card.id === 'insurance' && insurance.links && insurance.links.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {insurance.links.map(link => (
                              <Link
                                key={`insurance-link-${link.url}`}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  'display': 'flex',
                                  'alignItems': 'center',
                                  'gap': 0.5,
                                  'color': 'text.primary',
                                  'textDecoration': 'underline',
                                  'mb': 0.5,
                                  '&:hover': { color: 'primary.main' },
                                }}
                              >
                                {link.icon && <span>{link.icon}</span>}
                                <Typography variant="body2">{link.label}</Typography>
                              </Link>
                            ))}
                          </Box>
                        )}

                        {/* Finance link */}
                        {card.id === 'finance' && finance.links && finance.links.length > 0 && (
                          <Link
                            href={finance.links[0]?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              'display': 'inline-flex',
                              'alignItems': 'center',
                              'gap': 0.5,
                              'color': 'primary.main',
                              'textDecoration': 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {t('details')}
                            <OpenInNewIcon sx={{ fontSize: 14 }} />
                          </Link>
                        )}
                      </Box>
                    )
                  : (
                      <Box sx={emptyStateBoxSx}>
                        <Button
                          startIcon={<AddIcon />}
                          size="small"
                          sx={{ textTransform: 'none', color: 'text.secondary' }}
                        >
                          {t('add_details')}
                        </Button>
                      </Box>
                    )}
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* MOT History Modal */}
      <Dialog
        open={motHistoryOpen}
        onClose={() => setMotHistoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Full MOT History</DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <Box
            sx={{
              position: 'relative',
              pl: 4,
              pt: 1,
            }}
          >
            {/* Timeline vertical line */}
            <Box
              sx={{
                position: 'absolute',
                left: 23,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: 'divider',
              }}
            />
            {motTests.map((test, index) => {
              const isPassed = test.testResult === 'PASSED' || test.testResult === 'PASS';
              return (
                <Box
                  key={test.motTestNumber || `mot-test-${index}`}
                  sx={{ position: 'relative' }}
                >
                  {/* Timeline dot */}
                  <Box sx={{}}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -30,
                        top: 16,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: isPassed ? 'success.light' : 'error.light',
                        zIndex: 1,
                      }}
                    />
                    <Divider orientation="vertical" flexItem />
                  </Box>
                  <MotTestResultItem
                    test={test}
                    isLatest={index === 0}
                    showDetails
                  />
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
