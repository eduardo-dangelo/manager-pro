'use client';

import {
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  NoteAltOutlined as NoteAltOutlinedIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
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

type PropertyInfoSectionProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

export function PropertyInfoSection({ asset, locale, onUpdateAsset }: PropertyInfoSectionProps) {
  const t = useTranslations('Assets');
  const { playHoverSound } = useHoverSound();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [editedInfo, setEditedInfo] = useState(() => {
    const metadata = asset.metadata || {};
    return {
      address: metadata.info?.address || '',
      buyOrRent: metadata.info?.buyOrRent || '',
      propertyType: metadata.info?.propertyType || '',
      size: metadata.info?.size || '',
      bedrooms: metadata.info?.bedrooms || '',
      bathrooms: metadata.info?.bathrooms || '',
      value: metadata.info?.value || '',
    };
  });

  const handleSave = async () => {
    try {
      const metadata = asset.metadata || {};
      const updatedMetadata = {
        ...metadata,
        info: editedInfo,
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
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating property info:', error);
    }
  };

  const handleCancel = () => {
    const metadata = asset.metadata || {};
    setEditedInfo({
      address: metadata.info?.address || '',
      buyOrRent: metadata.info?.buyOrRent || '',
      propertyType: metadata.info?.propertyType || '',
      size: metadata.info?.size || '',
      bedrooms: metadata.info?.bedrooms || '',
      bathrooms: metadata.info?.bathrooms || '',
      value: metadata.info?.value || '',
    });
    setIsModalOpen(false);
  };

  const metadata = asset.metadata || {};
  const info = metadata.info || {};
  const hasData = info && Object.keys(info).length > 0 && Object.values(info).some(v => v !== '' && v !== null && v !== undefined);

  // Create array of info items
  const infoItems = [
    { key: 'address', label: t('property_address'), value: info.address, format: (v: any) => v },
    { key: 'buyOrRent', label: t('property_buy_or_rent'), value: info.buyOrRent, format: (v: any) => t(v) },
    { key: 'propertyType', label: t('property_type'), value: info.propertyType, format: (v: any) => v },
    { key: 'size', label: t('property_size'), value: info.size, format: (v: any) => v },
    { key: 'bedrooms', label: t('property_bedrooms'), value: info.bedrooms, format: (v: any) => v },
    { key: 'bathrooms', label: t('property_bathrooms'), value: info.bathrooms, format: (v: any) => v },
    { key: 'value', label: t('property_value'), value: info.value, format: (v: any) => `$${Number(v).toLocaleString()}` },
  ].filter(item => item.value !== '' && item.value !== null && item.value !== undefined);

  const maxVisible = 6; // 3 items per column * 2 columns
  const visibleItems = infoItems.slice(0, maxVisible);
  const hiddenItems = infoItems.slice(maxVisible);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
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
      handleMenuClose();
    } catch (error) {
      console.error('Failed to copy all:', error);
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
    handleMenuClose();
  };

  return (
    <Box sx={{ mt: 3 }}>
      {!hasData
        ? (
            <Box
              sx={{
                'p': 4,
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
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                {t('add_property_info_invitation')}
              </Typography>
            </Box>
          )
        : (
            <Card sx={{ mt: 2, boxShadow: 'none' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      color: 'text.primary',
                    }}
                  >
                    {t('property_info_title')}
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={handleMenuOpen}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={menuOpen}
                      onClose={handleMenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <MenuItem onClick={handleCopyAll}>
                        <ListItemIcon>
                          <ContentCopyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={handleEdit}>
                        <ListItemIcon>
                          <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>

                <Grid container spacing={1}>
                  {visibleItems.map(item => (
                    <Grid item xs={12} sm={6} key={item.key}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 140, flexShrink: 0 }}>
                          {item.label}
                          :
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            minWidth: 200,
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
                          <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600, cursor: 'pointer' }}>
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
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        {hiddenItems.map(item => (
                          <Grid item xs={12} sm={6} key={item.key}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 140, flexShrink: 0 }}>
                                {item.label}
                                :
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  minWidth: 200,
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
                                <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600, cursor: 'pointer' }}>
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
              </CardContent>
            </Card>
          )}

      <Dialog open={isModalOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{t('edit_property_info')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t('property_address')}
              value={editedInfo.address}
              onChange={e => setEditedInfo({ ...editedInfo, address: e.target.value })}
              multiline
              rows={2}
            />
            <FormControl fullWidth size="small">
              <InputLabel>{t('property_buy_or_rent')}</InputLabel>
              <Select
                value={editedInfo.buyOrRent}
                onChange={e => setEditedInfo({ ...editedInfo, buyOrRent: e.target.value })}
                label={t('property_buy_or_rent')}
              >
                <MenuItem value="buy">{t('buy')}</MenuItem>
                <MenuItem value="rent">{t('rent')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label={t('property_type')}
              value={editedInfo.propertyType}
              onChange={e => setEditedInfo({ ...editedInfo, propertyType: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('property_size')}
              value={editedInfo.size}
              onChange={e => setEditedInfo({ ...editedInfo, size: e.target.value })}
              placeholder="e.g., 1200 sq ft"
            />
            <TextField
              fullWidth
              size="small"
              label={t('property_bedrooms')}
              type="number"
              value={editedInfo.bedrooms}
              onChange={e => setEditedInfo({ ...editedInfo, bedrooms: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('property_bathrooms')}
              type="number"
              value={editedInfo.bathrooms}
              onChange={e => setEditedInfo({ ...editedInfo, bathrooms: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label={t('property_value')}
              type="number"
              value={editedInfo.value}
              onChange={e => setEditedInfo({ ...editedInfo, value: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>{t('cancel')}</Button>
          <Button onClick={handleSave} variant="contained">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
