'use client';

import {
  AccountCircleOutlined as AccountCircleIcon,
  BadgeOutlined as BadgeIcon,
  BarChartOutlined as BarChartIcon,
  BuildOutlined as BuildIcon,
  CakeOutlined as CakeIcon,
  CalendarTodayOutlined as CalendarTodayIcon,
  ColorLensOutlined as ColorLensIcon,
  ContentCopy as ContentCopyIcon,
  DirectionsCarOutlined as DirectionsCarIcon,
  Edit as EditIcon,
  LocalGasStationOutlined as LocalGasStationIcon,
  Search as SearchIcon,
  TimelineOutlined as TimelineIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { VehicleSpecItem } from '@/components/Assets/Asset/tabs/overview/VehicleSpecItem';
import { formatEngineSize, formatMileage } from '@/components/Assets/utils';
import { Card } from '@/components/common/Card';
import { DropdownButton } from '@/components/common/DropdownButton';
import { RegistrationPlate } from '@/components/common/RegistrationPlate';
import { useHoverSound } from '@/hooks/useHoverSound';

type Asset = {
  id: number;
  name: string;
  type?: string | null;
  metadata?: Record<string, any>;
  objectives?: any[];
  todos?: any[];
  sprints?: any[];
};

type VehicleSpecsSectionProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

export function VehicleSpecsSection({ asset, locale, onUpdateAsset }: VehicleSpecsSectionProps) {
  const t = useTranslations('Assets');
  const { playHoverSound } = useHoverSound();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [hasLookedUp, setHasLookedUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [registrationInput, setRegistrationInput] = useState('');
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [dvlaData, setDvlaData] = useState<any | null>(asset.metadata?.dvla ?? null);
  const [motData, setMotData] = useState<any | null>(asset.metadata?.mot ?? null);
  const [previewData, setPreviewData] = useState<{
    make?: string;
    model?: string;
    year?: string;
    color?: string;
    taxStatus?: string;
    motStatus?: string;
    fuel?: string;
  } | null>(null);
  const [lookedUpSpecs, setLookedUpSpecs] = useState(() => {
    const metadata = asset.metadata || {};
    return {
      registration: metadata.specs?.registration || '',
      make: metadata.specs?.make || '',
      model: metadata.specs?.model || '',
      fuel: metadata.specs?.fuel || '',
      year: metadata.specs?.year || '',
      color: metadata.specs?.color || '',
      mileage: metadata.specs?.mileage || '',
      vin: metadata.specs?.vin || '',
      engineSize: metadata.specs?.engineSize || '',
      transmission: metadata.specs?.transmission || '',
      engineNumber: metadata.specs?.engineNumber || '',
      driveTrain: metadata.specs?.driveTrain || '',
      weight: metadata.specs?.weight || '',
      seats: metadata.specs?.seats || '',
      cost: metadata.specs?.cost || '',
      taxStatus: metadata.specs?.taxStatus || '',
      motStatus: metadata.specs?.motStatus || '',
    };
  });
  const [editedSpecs, setEditedSpecs] = useState(() => {
    const metadata = asset.metadata || {};
    return {
      registration: metadata.specs?.registration || '',
      make: metadata.specs?.make || '',
      model: metadata.specs?.model || '',
      fuel: metadata.specs?.fuel || '',
      year: metadata.specs?.year || '',
      color: metadata.specs?.color || '',
      mileage: metadata.specs?.mileage || '',
      vin: metadata.specs?.vin || '',
      engineSize: metadata.specs?.engineSize || '',
      transmission: metadata.specs?.transmission || '',
      engineNumber: metadata.specs?.engineNumber || '',
      driveTrain: metadata.specs?.driveTrain || '',
      weight: metadata.specs?.weight || '',
      seats: metadata.specs?.seats || '',
      cost: metadata.specs?.cost || '',
    };
  });

  // UK registration format: AB12 CDE (2 letters, 2 numbers, space, 3 letters)
  const UK_REGISTRATION_REGEX = /^[A-Z]{2}\d{2} [A-Z]{3}$/;

  const formatRegistration = (value: string): string => {
    // Remove all spaces and non-alphanumeric characters, convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Auto-insert space after 4th character
    if (cleaned.length > 4) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)}`;
    }
    return cleaned;
  };

  const validateRegistration = (value: string): boolean => {
    if (!value.trim()) {
      return true; // Empty is valid (will be checked on submit)
    }
    return UK_REGISTRATION_REGEX.test(value);
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatRegistration(inputValue);
    setRegistrationInput(formatted);
    setLookupError(null);

    // Validate the formatted value
    if (formatted.trim() && !validateRegistration(formatted)) {
      setRegistrationError(t('vehicle_registration_invalid'));
    } else {
      setRegistrationError(null);
    }
  };

  const handleLookup = async () => {
    if (!registrationInput.trim()) {
      setLookupError('Please enter a registration number');
      return;
    }

    if (!validateRegistration(registrationInput)) {
      setRegistrationError(t('vehicle_registration_invalid'));
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const response = await fetch(`/${locale}/api/vehicles/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: registrationInput.trim().toUpperCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to lookup vehicle' }));
        throw new Error(errorData.error || 'Failed to lookup vehicle');
      }

      const data = await response.json();

      if (data.vehicle) {
        // Set preview data for the preview card
        setPreviewData({
          make: data.vehicle.make || '',
          model: data.vehicle.model || '',
          year: data.vehicle.year || '',
          color: data.vehicle.color || '',
          taxStatus: data.vehicle.taxStatus || '',
          motStatus: data.vehicle.motStatus || '',
          fuel: data.vehicle.fuel || '',
        });

        // Set full lookup specs
        setLookedUpSpecs({
          registration: data.vehicle.registration || registrationInput.trim().toUpperCase(),
          make: data.vehicle.make || '',
          model: data.vehicle.model || '',
          fuel: data.vehicle.fuel || '',
          year: data.vehicle.year || '',
          color: data.vehicle.color || '',
          mileage: data.vehicle.mileage || '',
          vin: data.vehicle.vin || '',
          engineSize: data.vehicle.engineSize || '',
          transmission: data.vehicle.transmission || '',
          engineNumber: data.vehicle.engineNumber || '',
          driveTrain: data.vehicle.driveTrain || '',
          weight: data.vehicle.weight || '',
          seats: data.vehicle.seats || '',
          cost: data.vehicle.cost || '',
          taxStatus: data.vehicle.taxStatus || '',
          motStatus: data.vehicle.motStatus || '',
        });
        setHasLookedUp(true);
        setDvlaData(data.dvla ?? null);
        setMotData(data.mot ?? null);
      } else {
        throw new Error('No vehicle data found');
      }
    } catch (error) {
      console.error('Error looking up vehicle:', error);
      setLookupError(error instanceof Error ? error.message : 'Failed to lookup vehicle');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleCancel = () => {
    const metadata = asset.metadata || {};
    setEditedSpecs({
      registration: metadata.specs?.registration || '',
      make: metadata.specs?.make || '',
      model: metadata.specs?.model || '',
      fuel: metadata.specs?.fuel || '',
      year: metadata.specs?.year || '',
      color: metadata.specs?.color || '',
      mileage: metadata.specs?.mileage || '',
      vin: metadata.specs?.vin || '',
      engineSize: metadata.specs?.engineSize || '',
      transmission: metadata.specs?.transmission || '',
      engineNumber: metadata.specs?.engineNumber || '',
      driveTrain: metadata.specs?.driveTrain || '',
      weight: metadata.specs?.weight || '',
      seats: metadata.specs?.seats || '',
      cost: metadata.specs?.cost || '',
    });
    setRegistrationInput('');
    setPreviewData(null);
    setDvlaData(asset.metadata?.dvla ?? null);
    setMotData(asset.metadata?.mot ?? null);
    setHasLookedUp(false);
    setLookupError(null);
    setRegistrationError(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      const metadata = asset.metadata || {};
      const maintenance = metadata.maintenance || {};

      // Extract tax expiry date from DVLA data
      let taxExpires: string | undefined;
      if (hasLookedUp && dvlaData) {
        taxExpires = (dvlaData as any)?.taxDueDate || undefined;
      }

      // Extract MOT expiry date from MOT data
      let motExpires: string | undefined;
      if (hasLookedUp && motData) {
        // Check for direct motExpiryDate field
        motExpires = (motData as any)?.motExpiryDate || undefined;

        // If not found, check the latest MOT test
        if (!motExpires && Array.isArray((motData as any)?.motTests) && (motData as any).motTests.length > 0) {
          const latestTest = (motData as any).motTests[0];
          motExpires = latestTest.expiryDate || undefined;
        }
      }

      // Update maintenance structure with expiry dates
      const updatedMaintenance = {
        ...maintenance,
        ...(taxExpires && {
          tax: {
            ...maintenance.tax,
            expires: taxExpires,
          },
        }),
        ...(motExpires && {
          mot: {
            ...maintenance.mot,
            expires: motExpires,
          },
        }),
      };

      const updatedMetadata = {
        ...metadata,
        specs: hasLookedUp ? lookedUpSpecs : editedSpecs,
        dvla: hasLookedUp ? dvlaData : metadata.dvla,
        mot: hasLookedUp ? motData : metadata.mot,
        maintenance: updatedMaintenance,
      };

      const registrationToPersist
        = (hasLookedUp ? lookedUpSpecs.registration : editedSpecs.registration)
          || metadata.specs?.registration
          || '';

      // Always update the asset name to Make Model on lookup save
      const newMake = hasLookedUp ? lookedUpSpecs.make : editedSpecs.make;
      const newModel = hasLookedUp ? lookedUpSpecs.model : editedSpecs.model;
      const newMakeModel = [newMake, newModel].filter(Boolean).join(' ');

      const updatePayload: Record<string, any> = { metadata: updatedMetadata };
      if (registrationToPersist) {
        updatePayload.registrationNumber = registrationToPersist;
      }
      if (newMakeModel) {
        updatePayload.name = newMakeModel;
      }

      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const updated = await response.json();
      onUpdateAsset({ ...asset, ...(updated.asset || {}), metadata: updatedMetadata });
      setRegistrationInput('');
      setPreviewData(null);
      setHasLookedUp(false);
      setLookupError(null);
      setRegistrationError(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating vehicle specs:', error);
    }
  };

  const metadata = asset.metadata || {};
  const specs = metadata.specs || {};
  const hasData = specs && Object.keys(specs).length > 0 && Object.values(specs).some(v => v !== '' && v !== null && v !== undefined);

  // Get mileage from latest MOT test, fallback to specs.mileage
  const getMileage = (): number | null => {
    const latestMotTest = motData?.motTests?.[0];
    const mileageFromMot = latestMotTest?.odometerValue;
    if (mileageFromMot !== null && mileageFromMot !== undefined) {
      return mileageFromMot;
    }

    // Fallback to specs.mileage
    const mileage = specs.mileage;
    if (!mileage) {
      return null;
    }
    const mileageNum = typeof mileage === 'number' ? mileage : Number.parseFloat(mileage.toString().replace(/[^0-9.]/g, ''));
    if (Number.isNaN(mileageNum)) {
      return null;
    }
    return mileageNum;
  };

  // Calculate age from year
  const calculateAge = (): number | null => {
    if (!specs.year) {
      return null;
    }
    const year = typeof specs.year === 'number' ? specs.year : Number.parseInt(specs.year.toString(), 10);
    if (Number.isNaN(year)) {
      return null;
    }
    const currentYear = new Date().getFullYear();
    return Math.max(0, currentYear - year);
  };

  // Calculate yearly mileage - calculate from total mileage / age
  const calculateYearMileage = (): number | null => {
    const totalMileage = getMileage();
    if (!totalMileage) {
      return null;
    }

    const age = calculateAge();
    if (!age || age === 0) {
      return null;
    }

    return Math.round(totalMileage / age);
  };

  const age = calculateAge();
  const mileage = getMileage();
  const yearMileage = calculateYearMileage();

  // Helper function to get icon for each spec item
  const getSpecIcon = (key: string) => {
    const iconProps = { sx: { fontSize: 24, color: 'text.secondary' } };
    switch (key) {
      case 'registration':
        return <BadgeIcon {...iconProps} />;
      case 'make':
        return <AccountCircleIcon {...iconProps} />;
      case 'model':
        return <DirectionsCarIcon {...iconProps} />;
      case 'year':
        return <CalendarTodayIcon {...iconProps} />;
      case 'age':
        return <CakeIcon {...iconProps} />;
      case 'color':
        return <ColorLensIcon {...iconProps} />;
      case 'fuel':
        return <LocalGasStationIcon {...iconProps} />;
      case 'mileage':
        return <BarChartIcon {...iconProps} />;
      case 'yearMileage':
        return <TimelineIcon {...iconProps} />;
      case 'engineSize':
        return <BuildIcon {...iconProps} />;
      default:
        return null;
    }
  };

  // Create array of spec items
  const specItems = [
    { key: 'make', label: t('vehicle_make'), value: specs.make, format: (v: any) => v },
    { key: 'model', label: t('vehicle_model'), value: specs.model, format: (v: any) => v },
    { key: 'age', label: 'Age', value: age, format: (v: any) => v ? `${v} yrs` : v },
    { key: 'year', label: t('vehicle_year'), value: specs.year, format: (v: any) => v },
    { key: 'registration', label: t('vehicle_registration'), value: specs.registration, format: (v: any) => v },
    { key: 'fuel', label: t('vehicle_fuel'), value: specs.fuel, format: (v: any) => v },
    { key: 'color', label: t('vehicle_color'), value: specs.color, format: (v: any) => v },
    { key: 'mileage', label: t('vehicle_mileage'), value: mileage, format: (v: any) => formatMileage(v) || v },
    { key: 'yearMileage', label: 'Yearly Mileage', value: yearMileage, format: (v: any) => formatMileage(v) || v },
    { key: 'engineSize', label: t('vehicle_engine_size'), value: specs.engineSize, format: (v: any) => formatEngineSize(v) || v },
  ];
  // .filter(item => item.value !== '' && item.value !== null && item.value !== undefined);

  // Handle saving individual spec items
  const handleSaveSpecItem = async (key: string, rawValue: string | number) => {
    try {
      const metadata = asset.metadata || {};
      const currentSpecs = metadata.specs || {};

      // Update the specific spec field
      const updatedSpecs = {
        ...currentSpecs,
        [key]: rawValue,
      };

      // Update metadata with new specs
      const updatedMetadata = {
        ...metadata,
        specs: updatedSpecs,
      };

      // Prepare update payload
      const updatePayload: Record<string, any> = { metadata: updatedMetadata };

      // If updating registration, also update registrationNumber field
      if (key === 'registration' && rawValue) {
        updatePayload.registrationNumber = rawValue;
      }

      // If updating make or model, update asset name
      if (key === 'make' || key === 'model') {
        const newMake = key === 'make' ? rawValue : (currentSpecs.make || '');
        const newModel = key === 'model' ? rawValue : (currentSpecs.model || '');
        const newMakeModel = [newMake, newModel].filter(Boolean).join(' ');
        if (newMakeModel) {
          updatePayload.name = newMakeModel;
        }
      }

      // Call API to save
      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const updated = await response.json();
      const finalMetadata = updated.asset?.metadata || updatedMetadata;
      onUpdateAsset({ ...asset, ...(updated.asset || {}), metadata: finalMetadata });
    } catch (error) {
      console.error('Error updating vehicle spec:', error);
      throw error; // Re-throw to let component handle it
    }
  };

  const handleCopyAll = async () => {
    try {
      const formattedText = specItems.map(item => `${item.label}: ${item.format(item.value)}`).join('\n\n');
      await navigator.clipboard.writeText(formattedText);
      setCopiedAll(true);
      setTimeout(() => {
        setCopiedAll(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to copy all:', error);
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const dropdownOptions = [
    {
      label: 'Copy',
      onClick: handleCopyAll,
      icon: <ContentCopyIcon fontSize="small" />,
    },
    {
      label: 'Edit',
      onClick: handleEdit,
      icon: <EditIcon fontSize="small" />,
    },
  ];

  return (
    <Box sx={{ mt: 0 }}>
      {!hasData
        ? (
            <Box
              sx={{
                'p': 6,
                'display': 'flex',
                'alignItems': 'center',
                'justifyContent': 'center',
                'gap': 2,
                'cursor': 'pointer',
                'border': '1px dashed',
                'borderColor': 'divider',
                'borderRadius': 1,
                'transition': 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <SearchIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
              <Typography sx={{ color: 'text.secondary' }}>
                {t('add_vehicle_specs_invitation')}
              </Typography>
            </Box>
          )
        : (
            <Card sx={{ mt: 2, p: 2.5 }}>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '1.25rem',
                  }}
                >
                  Specs
                </Typography>
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Fade in={copiedAll} mountOnEnter unmountOnExit>
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        right: 40,
                        whiteSpace: 'nowrap',
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      Copied
                    </Typography>
                  </Fade>
                  <DropdownButton
                    options={dropdownOptions}
                    tooltip="Actions"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {specItems.map(item => (
                  <VehicleSpecItem
                    key={item.key}
                    item={item}
                    icon={getSpecIcon(item.key)}
                    onSave={handleSaveSpecItem}
                    playHoverSound={playHoverSound}
                  />
                ))}
              </Box>

            </Card>
          )}

      <Dialog open={isModalOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{t('edit_vehicle_specs')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {/* Lookup input - always visible */}
            <Box>
              <ButtonGroup variant="outlined" sx={{ display: 'flex' }}>
                <TextField
                  size="small"
                  label={t('vehicle_registration')}
                  value={registrationInput}
                  onChange={handleRegistrationChange}
                  error={!!registrationError}
                  helperText={registrationError || ''}
                  sx={{
                    '& .MuiInputBase-input': {
                      textTransform: 'uppercase',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLookingUp) {
                      handleLookup();
                    }
                  }}
                />
                <Button
                  onClick={handleLookup}
                  disabled={isLookingUp || !registrationInput.trim() || !!registrationError}
                  variant="contained"
                  sx={{ minWidth: 280, px: 2 }}
                >
                  Lookup
                </Button>
              </ButtonGroup>
              <Button
                variant="text"
                size="small"
                sx={{ mt: 1, textTransform: 'none' }}
              >
                enter details manually
              </Button>
              {isLookingUp && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              {lookupError && (
                <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block' }}>
                  {lookupError}
                </Typography>
              )}
            </Box>

            {/* Preview card - shown when lookup is successful */}
            {previewData && (
              <Card sx={{ mt: 2, p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  {registrationInput && (
                    <RegistrationPlate registration={registrationInput} size="medium" />
                  )}
                  {(previewData.make || previewData.model) && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    >
                      {[previewData.make, previewData.model].filter(Boolean).join(' ')}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {previewData.make && (
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                          {t('vehicle_make')}
                          :
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {previewData.make}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {previewData.model && (
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                          {t('vehicle_model')}
                          :
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {previewData.model}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {previewData.year && (
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                          {t('vehicle_year')}
                          :
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {previewData.year}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {previewData.color && (
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                          {t('vehicle_color')}
                          :
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {previewData.color}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {previewData.taxStatus && (
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                          {t('vehicle_tax_status')}
                          :
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {previewData.taxStatus}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {previewData.motStatus && (
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                          {t('vehicle_mot_status')}
                          :
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {previewData.motStatus}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {previewData.fuel && (
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                          {t('vehicle_fuel')}
                          :
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {previewData.fuel}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Card>
            )}

            {/* Full details view - shown when hasLookedUp is true (for backward compatibility) */}
            {hasLookedUp && !previewData && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {lookedUpSpecs.registration && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_registration')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.registration}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.make && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_make')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.make}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.model && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_model')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.model}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.year && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_year')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.year}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.color && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_color')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.color}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.fuel && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_fuel')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.fuel}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.engineNumber && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_engine_number')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.engineNumber}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.driveTrain && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_drive_train')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.driveTrain}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.transmission && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_transmission')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.transmission}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.weight && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_weight')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.weight}
                      {' '}
                      {t('kg')}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.seats && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_seats')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.seats}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.mileage && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_mileage')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {typeof lookedUpSpecs.mileage === 'number'
                        ? lookedUpSpecs.mileage.toLocaleString()
                        : lookedUpSpecs.mileage}
                      {' '}
                      {t('miles')}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.vin && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_vin')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.vin}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.engineSize && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_engine_size')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.engineSize}
                    </Typography>
                  </Box>
                )}

                {lookedUpSpecs.cost && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {t('vehicle_cost')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      {lookedUpSpecs.cost}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>{t('cancel')}</Button>
          {hasLookedUp && (
            <Button onClick={handleSave} variant="contained">
              {t('save')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
