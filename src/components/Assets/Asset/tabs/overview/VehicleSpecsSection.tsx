'use client';

import {
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  NoteAltOutlined as NoteAltOutlinedIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { DropdownButton } from '@/components/common/DropdownButton';
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
  const [showMore, setShowMore] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [hasLookedUp, setHasLookedUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [registrationInput, setRegistrationInput] = useState('');
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

  const handleLookup = async () => {
    if (!registrationInput.trim()) {
      setLookupError('Please enter a registration number');
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
        });
        setHasLookedUp(true);
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
    setHasLookedUp(false);
    setLookupError(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      const metadata = asset.metadata || {};
      const updatedMetadata = {
        ...metadata,
        specs: hasLookedUp ? lookedUpSpecs : editedSpecs,
      };

      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      await response.json();
      onUpdateAsset({ ...asset, metadata: updatedMetadata });
      setRegistrationInput('');
      setHasLookedUp(false);
      setLookupError(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating vehicle specs:', error);
    }
  };

  const metadata = asset.metadata || {};
  const specs = metadata.specs || {};
  const hasData = specs && Object.keys(specs).length > 0 && Object.values(specs).some(v => v !== '' && v !== null && v !== undefined);

  // Create array of spec items
  const specItems = [
    { key: 'registration', label: t('vehicle_registration'), value: specs.registration, format: (v: any) => v },
    { key: 'make', label: t('vehicle_make'), value: specs.make, format: (v: any) => v },
    { key: 'model', label: t('vehicle_model'), value: specs.model, format: (v: any) => v },
    { key: 'year', label: t('vehicle_year'), value: specs.year, format: (v: any) => v },
    { key: 'color', label: t('vehicle_color'), value: specs.color, format: (v: any) => v },
    { key: 'fuel', label: t('vehicle_fuel'), value: specs.fuel, format: (v: any) => v },
    { key: 'engineNumber', label: t('vehicle_engine_number'), value: specs.engineNumber, format: (v: any) => v },
    { key: 'driveTrain', label: t('vehicle_drive_train'), value: specs.driveTrain, format: (v: any) => v },
    { key: 'transmission', label: t('vehicle_transmission'), value: specs.transmission, format: (v: any) => v },
    { key: 'weight', label: t('vehicle_weight'), value: specs.weight, format: (v: any) => `${v} ${t('kg')}` },
    { key: 'seats', label: t('vehicle_seats'), value: specs.seats, format: (v: any) => v },
    { key: 'mileage', label: t('vehicle_mileage'), value: specs.mileage, format: (v: any) => `${typeof v === 'number' ? v.toLocaleString() : v} ${t('miles')}` },
    { key: 'vin', label: t('vehicle_vin'), value: specs.vin, format: (v: any) => v },
    { key: 'engineSize', label: t('vehicle_engine_size'), value: specs.engineSize, format: (v: any) => v },
    { key: 'cost', label: t('vehicle_cost'), value: specs.cost, format: (v: any) => v },
  ].filter(item => item.value !== '' && item.value !== null && item.value !== undefined);

  const maxVisible = 10; // 3 items per column * 2 columns
  const visibleItems = specItems.slice(0, maxVisible);
  const hiddenItems = specItems.slice(maxVisible);
  const hasHiddenItems = hiddenItems.length > 0;

  const handleCopy = async (text: string, itemKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemKey);
      setTimeout(() => {
        setCopiedItem(null);
      }, 1000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyAll = async () => {
    try {
      const allItems = [...visibleItems, ...hiddenItems];
      const formattedText = allItems.map(item => `${item.label}: ${item.format(item.value)}`).join('\n\n');
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
              <NoteAltOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
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
                  // border: '1px solid',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {t('vehicle_specs_title')}
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

              <Grid container spacing={0}>
                {visibleItems.map(item => (
                  <Grid item key={item.key} sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                        {item.label}
                        :
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          minWidth: 240,
                          flex: 1,
                          // flexShrink: 0,
                          position: 'relative',
                        }}
                        onMouseEnter={() => {
                          setHoveredItem(item.key);
                          playHoverSound();
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => handleCopy(item.format(item.value), item.key)}
                      >
                        <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500, cursor: 'pointer' }}>
                          {item.format(item.value)}
                        </Typography>
                        {hoveredItem === item.key && (
                          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(item.format(item.value), item.key);
                              }}
                              sx={{
                                'padding': 0.25,
                                'minWidth': 'auto',
                                'width': 20,
                                'height': 20,
                                'color': 'text.secondary',
                                '&:hover': {
                                  color: 'primary.main',
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <Fade in={copiedItem === item.key} mountOnEnter unmountOnExit>
                              <Typography
                                variant="caption"
                                sx={{
                                  position: 'absolute',
                                  left: 28,
                                  whiteSpace: 'nowrap',
                                  color: 'text.secondary',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                }}
                              >
                                Copied
                              </Typography>
                            </Fade>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {hasHiddenItems && (
                <>
                  <Collapse in={showMore}>
                    <Grid container spacing={0} sx={{ mt: 1 }}>
                      {hiddenItems.map(item => (
                        <Grid item key={item.key} sx={{ width: { xs: '100%', md: '50%' } }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 130, flexShrink: 0 }}>
                              {item.label}
                              :
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                minWidth: 240,
                                flexShrink: 0,
                                position: 'relative',
                              }}
                              onMouseEnter={() => {
                                setHoveredItem(item.key);
                                playHoverSound();
                              }}
                              onMouseLeave={() => setHoveredItem(null)}
                              onClick={() => handleCopy(item.format(item.value), item.key)}
                            >
                              <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500, cursor: 'pointer' }}>
                                {item.format(item.value)}
                              </Typography>
                              {hoveredItem === item.key && (
                                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.format(item.value), item.key);
                                    }}
                                    sx={{
                                      'padding': 0.25,
                                      'minWidth': 'auto',
                                      'width': 20,
                                      'height': 20,
                                      'color': 'text.secondary',
                                      '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'action.hover',
                                      },
                                    }}
                                  >
                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                  <Fade in={copiedItem === item.key} mountOnEnter unmountOnExit>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        position: 'absolute',
                                        left: 28,
                                        whiteSpace: 'nowrap',
                                        color: 'text.secondary',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                      }}
                                    >
                                      Copied
                                    </Typography>
                                  </Fade>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      size="small"
                      onClick={() => setShowMore(!showMore)}
                      sx={{ textTransform: 'none' }}
                    >
                      {showMore ? 'View Less' : `View More (${hiddenItems.length})`}
                    </Button>
                  </Box>
                </>
              )}

            </Card>
          )}

      <Dialog open={isModalOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{t('edit_vehicle_specs')}</DialogTitle>
        <DialogContent>
          {!hasLookedUp
            ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  <Box>
                    <ButtonGroup fullWidth variant="outlined" sx={{ display: 'flex' }}>
                      <TextField
                        fullWidth
                        size="small"
                        label={t('vehicle_registration')}
                        value={registrationInput}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          setRegistrationInput(upperValue);
                          setLookupError(null);
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            textTransform: 'uppercase',
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
                        disabled={isLookingUp || !registrationInput.trim()}
                        variant="contained"
                        sx={{ minWidth: 100 }}
                      >
                        Lookup
                      </Button>
                    </ButtonGroup>
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
                </Box>
              )
            : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  {lookedUpSpecs.registration && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_registration')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.registration}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.make && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_make')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.make}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.model && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_model')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.model}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.year && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_year')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.year}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.color && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_color')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.color}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.fuel && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_fuel')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.fuel}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.engineNumber && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_engine_number')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.engineNumber}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.driveTrain && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_drive_train')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.driveTrain}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.transmission && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_transmission')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.transmission}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.weight && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_weight')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
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
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.seats}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.mileage && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_mileage')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
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
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.vin}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.engineSize && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_engine_size')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.engineSize}
                      </Typography>
                    </Box>
                  )}

                  {lookedUpSpecs.cost && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {t('vehicle_cost')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#4caf50' }}>
                        {lookedUpSpecs.cost}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
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
