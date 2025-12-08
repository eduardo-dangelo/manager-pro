'use client';

import type { DragEndEvent, Modifier } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Folder as DocsIcon,
  DragIndicator as DragIcon,
  Timeline as FinanceIcon,
  PhotoLibrary as GalleryIcon,
  Assessment as InsightsIcon,
  ListAlt as ListingIcon,
  DirectionsRun as SprintsIcon,
  ShowChart as TimelineIcon,
  CheckBox as TodosIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { CalendarTab } from '@/components/Assets/Asset/tabs/CalendarTab';
import { FinanceTab } from '@/components/Assets/Asset/tabs/FinanceTab';
import { OverviewTab } from '@/components/Assets/Asset/tabs/OverviewTab';
import { ReportTab } from '@/components/Assets/Asset/tabs/ReportTab';
import { SprintsTab } from '@/components/Assets/Asset/tabs/SprintsTab';
import { TimelineTab } from '@/components/Assets/Asset/tabs/TimelineTab';
import { TodosTab } from '@/components/Assets/Asset/tabs/TodosTab';

type Todo = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  objectiveId: number | null;
};

type Objective = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
};

type Sprint = {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};

type Asset = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  type?: string | null;
  tabs?: string[];
  metadata?: Record<string, any>;
  objectives: Objective[];
  todos: Todo[];
  sprints: Sprint[];
};

type AssetTabsProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Partial<Asset> | Asset) => void;
};

type SortableTabProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  isDragging?: boolean;
  isDraggable: boolean;
  handleTabClick: () => void;
  onRemoveTab?: () => void;
};

function SortableTab({ id, label, icon, isDraggable, handleTabClick, onRemoveTab }: SortableTabProps) {
  const {
    attributes,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    listeners,
  } = useSortable({ id, disabled: !isDraggable });

  const [showIcons, setShowIcons] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowIcons(true);
    }, 1200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setTimeout(() => {
      setShowIcons(false);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      onClick={handleTabClick}
      ref={setNodeRef}
      style={style}
      component="div"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <Tab
        icon={icon as any}
        iconPosition="start"
        label={label}
        sx={{
          '& .MuiTab-iconWrapper': {
            marginRight: 1,
          },
          'transition': 'padding-left 0.3s ease, padding-right 0.3s ease',
          // Always reserve space for icons to prevent tab width change
          // 'paddingRight': !showIcons ? (onRemoveTab ? '44px' : (isDraggable ? '28px' : '12px')) : '12px',
          'textAlign': 'center',

          'pl': showIcons && (onRemoveTab || isDraggable) ? 1 : 3,
          'pr': showIcons && (onRemoveTab || isDraggable) ? 5 : 3,
        }}
      />
      {isDraggable && (
        <Box
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          component="span"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          sx={{
            'position': 'absolute',
            'right': onRemoveTab ? '20px' : '4px',
            'top': '50%',
            'transform': 'translateY(-50%)',
            'display': 'flex',
            'alignItems': 'center',
            'cursor': 'grab',
            'outline': 'none',
            'touchAction': 'none',
            'width': '18px',
            'height': '18px',
            'opacity': showIcons ? 1 : 0,
            'transition': 'opacity 0.3s ease',
            'pointerEvents': showIcons ? 'auto' : 'none',
            'zIndex': 1,
            '&:hover svg': {
              opacity: 1,
              color: 'grey.700',
            },
            '&:active': {
              cursor: 'grabbing',
            },
          }}
        >
          <DragIcon
            sx={{
              fontSize: 18,
              color: 'grey.500',
              opacity: 0.8,
              flexShrink: 0,
              pointerEvents: 'none',
            }}
          />
        </Box>
      )}
      {onRemoveTab && (
        <Box
          component="span"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            onRemoveTab();
          }}
          sx={{
            'position': 'absolute',
            'right': '4px',
            'top': '50%',
            'transform': 'translateY(-50%)',
            'display': showIcons ? 'flex' : 'none',
            'alignItems': 'center',
            'justifyContent': 'center',
            'cursor': 'pointer',
            'padding': '2px',
            'borderRadius': '4px',
            'width': '18px',
            'height': '18px',
            'opacity': showIcons ? 1 : 0,
            'transition': 'opacity 0.3s ease',
            'pointerEvents': showIcons ? 'auto' : 'none',
            'zIndex': 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon
            sx={{
              'fontSize': 14,
              'color': 'grey.500',
              'opacity': 0.8,
              '&:hover': {
                color: 'error.main',
                opacity: 1,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export function AssetTabs({ asset, locale, onUpdateAsset }: AssetTabsProps) {
  const t = useTranslations('Assets');
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [addTabDialogOpen, setAddTabDialogOpen] = useState(false);
  const [removeTabDialogOpen, setRemoveTabDialogOpen] = useState(false);
  const [tabToRemove, setTabToRemove] = useState<string | null>(null);

  // Define all available tabs
  const availableTabs = ['overview', 'todos', 'calendar', 'sprints', 'finance', 'docs', 'gallery', 'listing', 'timeline', 'insights'];

  // Get asset's current tabs (default to ['overview'] if not set)
  const assetTabs = asset.tabs || ['overview'];

  // Find tabs that haven't been added yet
  // Filter out 'listing' tab unless asset type is 'property'
  const remainingTabs = availableTabs.filter((tab) => {
    if (tab === 'listing' && asset.type !== 'property') {
      return false;
    }
    return !assetTabs.includes(tab);
  });

  // Modifier to restrict movement to horizontal axis only
  const restrictToHorizontalAxis: Modifier = ({ transform }) => {
    return {
      ...transform,
      y: 0,
    };
  };

  // Drag and drop sensors - remove distance constraint to allow normal clicks
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Don't allow dragging the overview tab or dropping on it
    if (active.id === 'overview' || !over || active.id === over.id) {
      return;
    }

    const oldIndex = assetTabs.indexOf(active.id as string);
    const newIndex = assetTabs.indexOf(over.id as string);

    // Don't allow moving to position 0 (overview position)
    if (newIndex === 0) {
      return;
    }

    const newTabs = arrayMove(assetTabs, oldIndex, newIndex);

    // Optimistic update: Update UI immediately
    onUpdateAsset({ ...asset, tabs: newTabs });

    // Adjust current tab index immediately
    if (currentTab === oldIndex) {
      setCurrentTab(newIndex);
    } else if (currentTab > oldIndex && currentTab <= newIndex) {
      setCurrentTab(currentTab - 1);
    } else if (currentTab < oldIndex && currentTab >= newIndex) {
      setCurrentTab(currentTab + 1);
    }

    // Sync with API in the background
    try {
      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabs: newTabs }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder tabs');
      }

      // Optionally confirm with server response
      const { asset: updatedAsset } = await response.json();

      // If server response differs from optimistic update, sync it
      if (JSON.stringify(updatedAsset.tabs) !== JSON.stringify(newTabs)) {
        onUpdateAsset({ ...asset, tabs: updatedAsset.tabs });
      }
    } catch (error) {
      console.error('Error reordering tabs:', error);
      // Revert to original order on error
      onUpdateAsset({ ...asset, tabs: assetTabs });

      // Revert tab index
      if (currentTab === newIndex) {
        setCurrentTab(oldIndex);
      } else if (currentTab >= newIndex && currentTab < oldIndex) {
        setCurrentTab(currentTab + 1);
      } else if (currentTab <= newIndex && currentTab > oldIndex) {
        setCurrentTab(currentTab - 1);
      }
    }
  };

  const handleAddTab = async (tabName: string) => {
    const newTabs = [...assetTabs, tabName];

    // Optimistic update: Update UI immediately
    onUpdateAsset({ ...asset, tabs: newTabs });
    setAddTabDialogOpen(false);

    // Sync with API in the background
    try {
      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabs: newTabs }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tab');
      }

      const { asset: updatedAsset } = await response.json();

      // If server response differs from optimistic update, sync it
      if (JSON.stringify(updatedAsset.tabs) !== JSON.stringify(newTabs)) {
        onUpdateAsset({ ...asset, tabs: updatedAsset.tabs });
      }
    } catch (error) {
      console.error('Error adding tab:', error);
      // Revert on error
      onUpdateAsset({ ...asset, tabs: assetTabs });
      // Could optionally show an error message to the user here
    }
  };

  const handleRemoveTab = (tabName: string) => {
    // Prevent removing overview tab
    if (tabName === 'overview') {
      return;
    }

    // Show confirmation dialog
    setTabToRemove(tabName);
    setRemoveTabDialogOpen(true);
  };

  const confirmRemoveTab = async () => {
    if (!tabToRemove) {
      return;
    }

    const newTabs = assetTabs.filter(tab => tab !== tabToRemove);
    const removedIndex = assetTabs.indexOf(tabToRemove);

    // Close dialog
    setRemoveTabDialogOpen(false);
    setTabToRemove(null);

    // Optimistic update: Update UI immediately
    onUpdateAsset({ ...asset, tabs: newTabs });

    // Adjust current tab index if needed
    if (removedIndex <= currentTab) {
      if (currentTab > 0) {
        setCurrentTab(currentTab - 1);
      } else {
        setCurrentTab(0);
      }
    }

    // Sync with API in the background
    try {
      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabs: newTabs }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove tab');
      }

      const { asset: updatedAsset } = await response.json();

      // If server response differs from optimistic update, sync it
      if (JSON.stringify(updatedAsset.tabs) !== JSON.stringify(newTabs)) {
        onUpdateAsset({ ...asset, tabs: updatedAsset.tabs });
      }
    } catch (error) {
      console.error('Error removing tab:', error);
      // Revert on error
      onUpdateAsset({ ...asset, tabs: assetTabs });
      // Could optionally show an error message to the user here
    }
  };

  const getTabIcon = (tabName: string, iconProps?: { fontSize: number; mr?: number }) => {
    const props = iconProps || { fontSize: 18, mr: 0.5 };
    switch (tabName) {
      case 'overview':
        return <DashboardIcon sx={props} />;
      case 'todos':
        return <TodosIcon sx={props} />;
      case 'calendar':
        return <CalendarIcon sx={props} />;
      case 'sprints':
        return <SprintsIcon sx={props} />;
      case 'finance':
        return <FinanceIcon sx={props} />;
      case 'docs':
        return <DocsIcon sx={props} />;
      case 'gallery':
        return <GalleryIcon sx={props} />;
      case 'listing':
        return <ListingIcon sx={props} />;
      case 'timeline':
        return <TimelineIcon sx={props} />;
      case 'insights':
        return <InsightsIcon sx={props} />;
      default:
        return <DashboardIcon sx={props} />;
    }
  };

  const renderTabContent = (tabName: string) => {
    switch (tabName) {
      case 'overview':
        return (
          <OverviewTab
            asset={asset}
            locale={locale}
            onUpdateAsset={onUpdateAsset}
          />
        );
      case 'todos':
        return (
          <TodosTab
            asset={asset}
            locale={locale}
            onUpdateAsset={onUpdateAsset}
          />
        );
      case 'sprints':
        return (
          <SprintsTab
            asset={asset}
            locale={locale}
            onUpdateAsset={onUpdateAsset}
          />
        );
      case 'calendar':
        return <CalendarTab asset={asset} />;
      case 'timeline':
        return <TimelineTab asset={asset} />;
      case 'insights':
        return <ReportTab asset={asset} />;
      case 'finance':
        return <FinanceTab asset={asset} />;
      case 'docs':
      case 'gallery':
      case 'listing':
        return (
          <Box sx={{ p: 3, textAlign: 'center', color: 'grey.500' }}>
            {t(`tabs_${tabName}` as any)}
            {' '}
            - Coming soon
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <SortableContext
            items={assetTabs}
            strategy={horizontalListSortingStrategy}
          >
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                'flex': 1,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.938rem',
                  fontWeight: 500,
                  minHeight: 48,
                },
              }}
            >
              {assetTabs.map(tabName => (
                <SortableTab
                  key={tabName}
                  id={tabName}
                  icon={getTabIcon(tabName)}
                  label={t(`tabs_${tabName}` as any)}
                  isDraggable={tabName !== 'overview'}
                  handleTabClick={() => handleTabChange(null, assetTabs.indexOf(tabName))}
                  onRemoveTab={tabName !== 'overview' ? () => handleRemoveTab(tabName) : undefined}
                />
              ))}
            </Tabs>
          </SortableContext>
        </DndContext>
        {remainingTabs.length > 0 && (
          <Button
            size="small"
            onClick={() => setAddTabDialogOpen(true)}
            sx={{
              'textTransform': 'none',
              'color': theme.palette.mode === 'dark' ? 'text.secondary' : 'grey.600',
              'minWidth': 'auto',
              'px': 1.5,
              'overflow': 'hidden',
              'position': 'relative',
              'display': 'flex',
              'alignItems': 'center',
              'gap': 0.5,
              '&:hover': {
                'backgroundColor': 'action.hover',
                '& .add-tab-label': {
                  maxWidth: '100px',
                  opacity: 1,
                  marginLeft: 0,
                },
              },
              '& .add-tab-label': {
                maxWidth: 0,
                opacity: 0,
                marginLeft: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'max-width 0.3s ease, opacity 0.3s ease',
              },
            }}
          >
            <AddIcon sx={{ fontSize: 18, flexShrink: 0 }} />
            <span className="add-tab-label">{t('add_tab')}</span>
          </Button>
        )}
      </Box>

      <Box>
        {assetTabs.map((tabName, index) => (
          <Box key={tabName} sx={{ display: currentTab === index ? 'block' : 'none' }}>
            {renderTabContent(tabName)}
          </Box>
        ))}
      </Box>

      {/* Add Tab Dialog */}
      <Dialog open={addTabDialogOpen} onClose={() => setAddTabDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('select_tab')}</DialogTitle>
        <DialogContent>
          <List>
            {remainingTabs.map(tabName => (
              <ListItem key={tabName} disablePadding>
                <ListItemButton onClick={() => handleAddTab(tabName)}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getTabIcon(tabName, { fontSize: 20 })}
                  </ListItemIcon>
                  <ListItemText primary={t(`tabs_${tabName}` as any)} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTabDialogOpen(false)}>{t('cancel')}</Button>
        </DialogActions>
      </Dialog>

      {/* Remove Tab Confirmation Dialog */}
      <Dialog
        open={removeTabDialogOpen}
        onClose={() => setRemoveTabDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: theme.palette.mode === 'dark' ? 'background.default !important' : undefined,
            },
          },
        }}
      >
        <DialogTitle>{t('remove_tab_confirm_title')}</DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ py: 0 }}>
            {t('remove_tab_confirm_message')}
            {' '}
            <strong>{tabToRemove ? t(`tabs_${tabToRemove}` as any) : ''}</strong>
            ?
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t('remove_tab_data_warning')}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={() => setRemoveTabDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={confirmRemoveTab}
            color="error"
            variant="contained"
            sx={{ textTransform: 'capitalize' }}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
