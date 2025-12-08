'use client';

import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
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

export function VehicleMaintenanceSection({
  asset,
  locale,
  onUpdateAsset,
}: VehicleMaintenanceSectionProps) {
  const t = useTranslations('Assets');
  const [isEditing, setIsEditing] = useState(false);

  const metadata = asset.metadata || {};
  const maintenance = metadata.maintenance || {};

  const mot: MaintenanceItem = maintenance.mot || {};
  const tax: MaintenanceItem = maintenance.tax || {};
  const insurance: MaintenanceItem = maintenance.insurance || {};
  const finance: MaintenanceItem = maintenance.finance || {};
  const service: MaintenanceItem = maintenance.service || {};
  const todo: Array<{ text: string; checked: boolean }> = maintenance.todo || [];

  const handleUpdateMaintenance = async (field: string, value: any) => {
    try {
      const updatedMetadata = {
        ...metadata,
        maintenance: {
          ...maintenance,
          [field]: value,
        },
      };

      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const { asset: updatedAsset } = await response.json();
      onUpdateAsset({ ...asset, metadata: updatedMetadata });
    } catch (error) {
      console.error('Error updating maintenance:', error);
    }
  };

  const handleDateChange = (field: string, date: string) => {
    const current = maintenance[field] || {};
    handleUpdateMaintenance(field, { ...current, expires: date });
  };

  const handleTodoToggle = (index: number) => {
    const updatedTodo = [...todo];
    updatedTodo[index] = { ...updatedTodo[index], checked: !updatedTodo[index].checked };
    handleUpdateMaintenance('todo', updatedTodo);
  };

  const MaintenanceCard = ({
    title,
    data,
    field,
    showEndsOn = false,
    showService = false,
    showTodo = false,
  }: {
    title: string;
    data: MaintenanceItem | Array<{ text: string; checked: boolean }>;
    field: string;
    showEndsOn?: boolean;
    showService?: boolean;
    showTodo?: boolean;
  }) => {
    const maintenanceData = data as MaintenanceItem;
    const todoData = data as Array<{ text: string; checked: boolean }>;

    return (
      <Card
        sx={{

          pl: 2,
          py: 1.5,
          minHeight: 120,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          {title}
          :
        </Typography>

        {showTodo
          ? (
              <Box>
                {todoData.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                  >
                    <Checkbox
                      checked={item.checked}
                      onChange={() => handleTodoToggle(index)}
                      size="small"
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckBoxIcon />}
                    />
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )
          : (
              <>
                {showService
                  ? (
                      <>
                        {maintenanceData.lastService && (
                          <Typography variant="body2" sx={{ color: 'success.main', mb: 0.5 }}>
                            {t('last_service')}
                            :
                            {maintenanceData.lastService.date}
                            {' '}
                            -
                            {' '}
                            {maintenanceData.lastService.mileage.toLocaleString()}
                            {' '}
                            {t('miles')}
                          </Typography>
                        )}
                        {maintenanceData.nextService && (
                          <Typography variant="body2" sx={{ color: 'success.main' }}>
                            {t('next_service')}
                            :
                            {maintenanceData.nextService.date}
                            {' '}
                            -
                            {' '}
                            {maintenanceData.nextService.mileage.toLocaleString()}
                            {' '}
                            {t('miles')}
                          </Typography>
                        )}
                      </>
                    )
                  : (
                      <Typography variant="body2" sx={{ color: 'success.main', mb: 1 }}>
                        {showEndsOn ? t('ends_on') : t('expires')}
                        :
                        {' '}
                        {isEditing
                          ? (
                              <TextField
                                type="date"
                                value={maintenanceData.endsOn || maintenanceData.expires || ''}
                                onChange={e =>
                                  handleDateChange(field, e.target.value)}
                                size="small"
                                sx={{ width: 150, ml: 1 }}
                                InputLabelProps={{ shrink: true }}
                              />
                            )
                          : (
                              maintenanceData.endsOn || maintenanceData.expires || '-'
                            )}
                      </Typography>
                    )}

                {maintenanceData.links && maintenanceData.links.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {maintenanceData.links.map((link, index) => (
                      <Link
                        key={index}
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

                {field === 'finance' && maintenanceData.links && maintenanceData.links.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PlayArrowIcon fontSize="small" />
                    <Link
                      href={maintenanceData.links[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        'color': 'text.primary',
                        'textDecoration': 'none',
                        '&:hover': { textDecoration: 'underline', color: 'primary.main' },
                      }}
                    >
                      {t('details')}
                    </Link>
                  </Box>
                )}
              </>
            )}
      </Card>
    );
  };

  return (
    <Box sx={{ m: -1.5 }}>

      <Grid container spacing={0}>
        <Grid item key={0} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }}>
          <MaintenanceCard
            title={t('mot')}
            data={mot}
            field="mot"
          />
        </Grid>

        <Grid item key={1} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }}>
          <MaintenanceCard
            title={t('tax')}
            data={tax}
            field="tax"
          />
        </Grid>

        <Grid item key={2} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }}>
          <MaintenanceCard
            title={t('insurance')}
            data={insurance}
            field="insurance"
          />
        </Grid>

        <Grid item key={3} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }}>
          <MaintenanceCard
            title={t('finance_agreement')}
            data={finance}
            field="finance"
            showEndsOn
          />
        </Grid>

        <Grid item key={4} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }}>
          <MaintenanceCard
            title={t('service')}
            data={service}
            field="service"
            showService
          />
        </Grid>

        <Grid item key={5} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }}>
          <MaintenanceCard
            title={t('todo')}
            data={todo}
            field="todo"
            showTodo
          />
        </Grid>
      </Grid>
    </Box>
  );
}
