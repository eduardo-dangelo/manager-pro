'use client';

import type { SxProps, Theme } from '@mui/material';
import type { ReactElement, ReactNode } from 'react';
import {
  Add as AddIcon,
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
  IconButton,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { MotTestResultItem } from '@/components/Assets/Asset/tabs/overview/MotTestResultItem';
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
  odometerValue?: number;
  odometerUnit?: string;
  odometerResultType?: string;
  motTestNumber?: string;
  rfrAndComments?: Array<{
    text?: string;
    type?: string;
    dangerous?: boolean;
  }>;
};

// Type definitions for array-based structure
type MaintenanceSectionItem = {
  label: string;
  icon?: ReactElement;
  value: ReactNode;
  customSx?: (value: any) => SxProps<Theme>;
  renderCustom?: () => ReactNode;
};

type BottomLink = {
  href: string;
  labelKey: string;
};

type HeaderAction = {
  icon: ReactElement;
  tooltipKey: string;
  onClick: () => void;
};

type MaintenanceCardConfig = {
  id: string;
  titleKey: string;
  hasData: () => boolean;
  sections: MaintenanceSectionItem[];
  bottomLink?: BottomLink;
  headerActions?: HeaderAction[];
};

type MaintenanceSectionItemProps = {
  label: string;
  icon?: ReactElement;
  value: ReactNode;
  customSx?: SxProps<Theme>;
  valueIcon?: ReactElement;
};

// Reusable component for rendering maintenance section items
function MaintenanceSectionItemComponent({
  label,
  icon,
  value,
  customSx,
  valueIcon,
}: MaintenanceSectionItemProps) {
  const defaultSx: SxProps<Theme> = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    p: 1,
    display: 'flex',
    alignItems: 'center',
    // gap: 0.5,
    justifyContent: 'space-between',
  };

  const mergedSx: SxProps<Theme> = customSx ? { ...defaultSx, ...customSx } : defaultSx;

  return (
    <Box sx={mergedSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon && (
          <Box sx={{ fontSize: '1.075rem', color: customSx?.color || 'text.secondary' }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" sx={{ color: customSx?.color || 'text.primary', mb: 0 }}>
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

        <Typography variant="body2" sx={{ color: customSx?.color || 'text.primary', mb: 0, fontWeight: 600 }}>
          {value}
        </Typography>
        {valueIcon}
      </Box>

    </Box>
  );
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
  cards.push({
    id: 'mot',
    titleKey: 'mot',
    hasData: () => hasMotData,
    sections: latestMotTest
      ? [
          {
            label: 'Mot Status',
            icon: <HistoryIcon />,
            value: latestMotTest?.testResult,
            valueIcon: getIcon(latestMotTest?.testResult === 'FAILED' || latestMotTest?.testResult === 'FAIL', latestMotTest?.testResult === 'ADVISORY' || latestMotTest?.testResult === 'ADVISORY'),
            customSx: (value: string) => {
              const color = getStatusColors(value === 'FAILED' || value === 'FAIL', value === 'ADVISORY' || value === 'ADVISORY');
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
            value: formatDate(latestMotTest?.expiryDate),
          },
          {
            label: 'Remaining days',
            icon: <CalendarIconOutlined />,
            value: latestMotTest?.expiryDate ? Math.max(0, moment(latestMotTest?.expiryDate).diff(moment(), 'days')) : '-',
          },
        ]
      : [],
    headerActions:
      motTests.length > 1
        ? [
            {
              icon: <HistoryIcon fontSize="small" />,
              tooltipKey: 'view_mot_history',
              onClick: () => setMotHistoryOpen(true),
            },
          ]
        : undefined,
  });

  // Tax Card
  cards.push({
    id: 'tax',
    titleKey: 'tax',
    hasData: () => hasTaxData,
    sections: taxExpiry
      ? [
          ...(taxStatus
            ? [
                {
                  label: t('status'),
                  icon: <HistoryIcon />,
                  value: taxStatus,
                  valueIcon: getIcon(taxStatus !== 'Taxed', taxExpiry ? moment(taxExpiry).diff(moment(), 'days') <= 30 : false),
                  customSx: (value: string) => {
                    const color = getStatusColors(value !== 'Taxed', taxExpiry ? moment(taxExpiry).diff(moment(), 'days') <= 30 : false);
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
            icon: <CalendarIconOutlined />,
            value: taxExpiry ? Math.max(0, moment(taxExpiry).diff(moment(), 'days')) : '-',
          },
        ]
      : [],
    bottomLink: {
      href: 'https://www.gov.uk/vehicle-tax',
      labelKey: 'tax_your_vehicle',
    },
  });

  // Insurance Card
  cards.push({
    id: 'insurance',
    titleKey: 'insurance',
    hasData: () => Boolean(hasMaintenanceData(insurance)),
    sections: insurance.expires
      ? [
          {
            label: t('expires'),
            icon: <CalendarIconOutlined />,
            value: formatDate(insurance.expires),
          },
        ]
      : [],
    // Insurance links will be handled separately in render
  });

  // Finance Card
  cards.push({
    id: 'finance',
    titleKey: 'finance_agreement',
    hasData: () => Boolean(hasMaintenanceData(finance)),
    sections: finance.endsOn || finance.expires
      ? [
          {
            label: t('ends_on'),
            icon: <CalendarIconOutlined />,
            value: formatDate(finance.endsOn || finance.expires),
          },
        ]
      : [],
  });

  // Service Card
  cards.push({
    id: 'service',
    titleKey: 'service',
    hasData: () => Boolean(hasMaintenanceData(service)),
    sections: [
      ...(service.lastService
        ? [
            {
              label: t('last_service'),
              value: `${formatDate(service.lastService.date)} - ${service.lastService.mileage.toLocaleString()} ${t('miles')}`,
            },
          ]
        : []),
      ...(service.nextService
        ? [
            {
              label: t('next_service'),
              value: `${formatDate(service.nextService.date)} - ${service.nextService.mileage.toLocaleString()} ${t('miles')}`,
            },
          ]
        : []),
    ],
  });

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
    width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' },
    minHeight: 120,
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
    <Box sx={{ m: -1.5 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          p: 1.5,
        }}
      >
        {maintenanceCards.map((card) => {
          const hasData = card.hasData();
          const titleVariant = hasData
            ? 'h6'
            : 'subtitle2';

          return (
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
                  {t(card.titleKey as any)}
                  {!hasData && ':'}
                </Typography>
                {hasData && card.headerActions && (
                  <Box>
                    {card.headerActions.map(action => (
                      <Tooltip key={action.tooltipKey} title={t(action.tooltipKey as any)}>
                        <IconButton
                          size="small"
                          onClick={action.onClick}
                          sx={{
                            'color': 'text.secondary',
                            '&:hover': {
                              color: 'text.primary',
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          {action.icon}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                )}
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

                            return (
                              <MaintenanceSectionItemComponent
                                key={`${card.id}-item-${sectionIndex}`}
                                label={section.label}
                                icon={section.icon}
                                value={section.value}
                                customSx={customSx}
                                valueIcon={section.valueIcon}
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

                      {/* Bottom link (e.g., Tax your vehicle) */}
                      {card.bottomLink && (
                        <Link
                          href={card.bottomLink.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            'display': 'inline-flex',
                            'alignItems': 'center',
                            'gap': 0.5,
                            'fontSize': '0.875rem',
                            'color': 'primary.main',
                            'textDecoration': 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {t(card.bottomLink.labelKey as any)}
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
