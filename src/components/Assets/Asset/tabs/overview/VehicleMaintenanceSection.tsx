'use client';

import {
  Add as AddIcon,
  CalendarTodayOutlined as CalendarIconOutlined,
  History as HistoryIcon,
  OpenInNew as OpenInNewIcon,
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

  const mot: MaintenanceItem = maintenance.mot || {};
  const tax: MaintenanceItem = maintenance.tax || {};
  const insurance: MaintenanceItem = maintenance.insurance || {};
  const finance: MaintenanceItem = maintenance.finance || {};
  const service: MaintenanceItem = maintenance.service || {};

  // Get MOT tests from the stored MOT data
  const motTests: MotTest[] = motData.motTests || [];
  const latestMotTest = motTests.length > 0 ? motTests[0] : null;

  // Get DVLA data for tax info
  const dvlaData = metadata.dvla || {};

  const hasMotData = latestMotTest || mot.expires;
  const hasTaxData = tax.expires || dvlaData.taxStatus || dvlaData.taxDueDate;
  const taxExpiry = tax.expires || dvlaData.taxDueDate;
  const taxStatus = dvlaData.taxStatus;

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
    // color: 'text.secondary',
    fontWeight: 500,
    mb: 1,
    textTransform: 'uppercase' as const,
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
        {/* MOT Card */}
        {hasMotData
          ? (
              <Card sx={{ ...cardSx, px: 2, py: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" sx={titleSx}>
                    {t('mot')}
                  </Typography>
                  {motTests.length > 1 && (
                    <Tooltip title={t('view_mot_history')}>
                      <IconButton
                        size="small"
                        onClick={() => setMotHistoryOpen(true)}
                        sx={{
                          'color': 'text.secondary',
                          '&:hover': {
                            color: 'text.primary',
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                {latestMotTest
                  ? (
                      <Card sx={{ ...cardSx, px: 1, width: '100%' }}>
                        <MotTestResultItem test={latestMotTest} showDetails={false} variant="vertical" />
                      </Card>
                    )
                  : (
                      <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
                        {t('expires')}
                        :
                        {' '}
                        {formatDate(mot.expires)}
                      </Typography>
                    )}
              </Card>
            )
          : (
              <Card sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ ...titleSx, px: 2, pt: 1.5 }}>
                  {t('mot')}
                  :
                </Typography>
                <Box sx={emptyStateBoxSx}>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    {t('add_details')}
                  </Button>
                </Box>
              </Card>
            )}

        {/* Tax Card */}
        {hasTaxData
          ? (
              <Card sx={{ ...cardSx, px: 2, py: 1.5 }}>
                <Typography variant="h6" sx={titleSx}>
                  {t('tax')}

                </Typography>
                {taxExpiry && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {taxStatus && (
                      <Box sx={{
                        border: '1px solid',
                        borderColor: taxStatus === 'Taxed' ? 'success.light' : 'error.light',
                        backgroundColor: taxStatus === 'Taxed' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                        borderRadius: 1,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        justifyContent: 'space-between',
                        elevation: 5,
                      }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <HistoryIcon sx={{ fontSize: '1.275rem', color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ color: 'text.primary', mb: 0 }}>
                            {t('status')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.primary', mb: 0, fontWeight: 600 }}>
                          {taxStatus}
                        </Typography>

                      </Box>
                    )}
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIconOutlined sx={{ fontSize: '1.275rem', color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.primary', mb: 0 }}>
                          {t('expires')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.primary', mb: 0, fontWeight: 600 }}>
                        {formatDate(taxExpiry)}
                      </Typography>
                    </Box>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIconOutlined sx={{ fontSize: '1.275rem', color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.primary', mb: 0 }}>
                          Remaining days
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.primary', mb: 0, fontWeight: 600 }}>
                        {taxExpiry ? Math.max(0, moment(taxExpiry).diff(moment(), 'days')) : '-'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Link
                  href="https://www.gov.uk/vehicle-tax"
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
                  {t('tax_your_vehicle')}
                  <OpenInNewIcon sx={{ fontSize: 14 }} />
                </Link>
              </Card>
            )
          : (
              <Card sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ ...titleSx, px: 2, pt: 1.5 }}>
                  {t('tax')}
                  :
                </Typography>
                <Box sx={emptyStateBoxSx}>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    {t('add_details')}
                  </Button>
                </Box>
              </Card>
            )}

        {/* Insurance Card */}
        {hasMaintenanceData(insurance)
          ? (
              <Card sx={{ ...cardSx, pl: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={titleSx}>
                  {t('insurance')}
                  :
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
                  {t('expires')}
                  :
                  {' '}
                  {formatDate(insurance.expires)}
                </Typography>
                {insurance.links && insurance.links.length > 0 && (
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
              </Card>
            )
          : (
              <Card sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ ...titleSx, px: 2, pt: 1.5 }}>
                  {t('insurance')}
                  :
                </Typography>
                <Box sx={emptyStateBoxSx}>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    {t('add_details')}
                  </Button>
                </Box>
              </Card>
            )}

        {/* Finance Card */}
        {hasMaintenanceData(finance)
          ? (
              <Card sx={{ ...cardSx, pl: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={titleSx}>
                  {t('finance_agreement')}
                  :
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
                  {t('ends_on')}
                  :
                  {' '}
                  {formatDate(finance.endsOn || finance.expires)}
                </Typography>
                {finance.links && finance.links.length > 0 && (
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
              </Card>
            )
          : (
              <Card sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ ...titleSx, px: 2, pt: 1.5 }}>
                  {t('finance_agreement')}
                  :
                </Typography>
                <Box sx={emptyStateBoxSx}>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    {t('add_details')}
                  </Button>
                </Box>
              </Card>
            )}

        {/* Service Card */}
        {hasMaintenanceData(service)
          ? (
              <Card sx={{ ...cardSx, pl: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={titleSx}>
                  {t('service')}
                  :
                </Typography>
                {service.lastService && (
                  <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
                    {t('last_service')}
                    :
                    {' '}
                    {formatDate(service.lastService.date)}
                    {' '}
                    -
                    {' '}
                    {service.lastService.mileage.toLocaleString()}
                    {' '}
                    {t('miles')}
                  </Typography>
                )}
                {service.nextService && (
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {t('next_service')}
                    :
                    {' '}
                    {formatDate(service.nextService.date)}
                    {' '}
                    -
                    {' '}
                    {service.nextService.mileage.toLocaleString()}
                    {' '}
                    {t('miles')}
                  </Typography>
                )}
              </Card>
            )
          : (
              <Card sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ ...titleSx, px: 2, pt: 1.5 }}>
                  {t('service')}
                  :
                </Typography>
                <Box sx={emptyStateBoxSx}>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                  >
                    {t('add_details')}
                  </Button>
                </Box>
              </Card>
            )}
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
