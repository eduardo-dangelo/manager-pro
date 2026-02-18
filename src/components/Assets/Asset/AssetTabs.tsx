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
  MoreHoriz as MoreHorizIcon,
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
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CalendarTab } from '@/components/Assets/Asset/tabs/CalendarTab';
import { DocsTab } from '@/components/Assets/Asset/tabs/DocsTab';
import { FinanceTab } from '@/components/Assets/Asset/tabs/FinanceTab';
import { GalleryTab } from '@/components/Assets/Asset/tabs/GalleryTab';
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
  tabRef?: (element: HTMLDivElement | null) => void;
};

function SortableTab({ id, label, icon, isDraggable, handleTabClick, onRemoveTab, tabRef }: SortableTabProps) {
  const {
    attributes,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    listeners,
  } = useSortable({ id, disabled: !isDraggable });

  // Combine refs for both sortable and measurement
  const combinedRef = (element: HTMLDivElement | null) => {
    setNodeRef(element);
    if (tabRef) {
      tabRef(element);
    }
  };

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
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setTimeout(() => {
      setShowIcons(false);
    }, 500);
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
      ref={combinedRef}
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [addTabDialogOpen, setAddTabDialogOpen] = useState(false);
  const [removeTabDialogOpen, setRemoveTabDialogOpen] = useState(false);
  const [tabToRemove, setTabToRemove] = useState<string | null>(null);

  // Refs for width calculation and scrolling
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const calendarRefreshRef = useRef<(() => void) | null>(null);
  const registerCalendarRefresh = useCallback((fn: (() => void) | null) => {
    calendarRefreshRef.current = fn;
  }, []);

  // Define all available tabs
  const availableTabs = ['overview', 'todos', 'calendar', 'sprints', 'finance', 'docs', 'gallery', 'listing', 'timeline', 'insights'];

  // Get asset's current tabs (default to ['overview'] if not set)
  const assetTabs = asset.tabs || ['overview'];

  // Derive current tab from URL
  const tabFromUrl = searchParams.get('tab');
  const currentTabIndex = assetTabs.includes(tabFromUrl ?? '')
    ? assetTabs.indexOf(tabFromUrl!)
    : 0;

  const updateUrlForTab = useCallback(
    (tabName: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tabName || 'overview');
      const query = params.toString();
      router.replace(pathname + (query ? `?${query}` : ''));
    },
    [pathname, router, searchParams],
  );

  // Redirect to overview tab when no tab param is provided
  useEffect(() => {
    if (!searchParams.has('tab')) {
      updateUrlForTab('overview');
    }
  }, [searchParams, updateUrlForTab]);

  // State for hidden tabs and menu
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Find tabs that haven't been added yet
  // Filter out 'listing' tab unless asset type is 'property'
  const remainingTabs = availableTabs.filter((tab) => {
    if (tab === 'listing' && asset.type !== 'property') {
      return false;
    }
    return !assetTabs.includes(tab);
  });

  // Calculate which tabs are partially hidden based on scroll position and container bounds
  useEffect(() => {
    const calculatePartiallyHiddenTabs = () => {
      const container = tabsContainerRef.current;

      if (!container || assetTabs.length === 0) {
        setHiddenTabs([]);
        return;
      }

      // Find MUI's internal scroll container (the div with overflow-x: auto)
      // MUI Tabs with variant="scrollable" creates a scroll container with class MuiTabs-scrollableX
      const scrollContainer = container.querySelector<HTMLElement>('.MuiTabs-scrollableX')
        || container.querySelector<HTMLElement>('[class*="scrollable"]');

      if (!scrollContainer) {
        // If scroll container not found, assume all visible
        setHiddenTabs([]);
        return;
      }

      const scrollContainerRect = scrollContainer.getBoundingClientRect();

      // Account for dropdown button width (approximately 48px + padding)
      const dropdownButtonSpace = 64;
      const visibleRight = scrollContainerRect.width - dropdownButtonSpace;

      const hidden: string[] = [];

      // Check each tab to see if it's partially hidden
      for (const tabName of assetTabs) {
        const tabElement = tabRefs.current.get(tabName);

        if (tabElement) {
          const tabRect = tabElement.getBoundingClientRect();

          // Calculate position relative to scroll container
          const tabLeft = tabRect.left - scrollContainerRect.left;
          const tabRight = tabLeft + tabRect.width;

          // Tab is considered partially hidden if its right edge extends beyond visible area
          // or its left edge is before the visible area starts
          if (tabRight > visibleRight || tabLeft < 0) {
            hidden.push(tabName);
          }
        }
      }

      setHiddenTabs(hidden);
    };

    // Initial calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(calculatePartiallyHiddenTabs, 100);

    // Add resize observer
    const resizeObserver = new ResizeObserver(() => {
      calculatePartiallyHiddenTabs();
    });

    if (tabsContainerRef.current) {
      resizeObserver.observe(tabsContainerRef.current);
    }

    // Find and observe the scroll container
    let scrollContainer: HTMLElement | null = null;
    let resizeTimeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
      resizeTimeoutId = setTimeout(calculatePartiallyHiddenTabs, 100);
    };

    const scrollContainerTimeout = setTimeout(() => {
      const container = tabsContainerRef.current;
      if (!container) {
        return;
      }

      scrollContainer = container.querySelector<HTMLElement>('.MuiTabs-scrollableX')
        || container.querySelector<HTMLElement>('[class*="scrollable"]');

      if (scrollContainer) {
        resizeObserver.observe(scrollContainer);
        scrollContainer.addEventListener('scroll', calculatePartiallyHiddenTabs);
      }
    }, 150);

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(scrollContainerTimeout);
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', calculatePartiallyHiddenTabs);
      }
    };
  }, [assetTabs, remainingTabs.length]);

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
    const tabName = assetTabs[newValue];
    if (tabName) {
      updateUrlForTab(tabName);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuTabClick = (tabName: string) => {
    const index = assetTabs.indexOf(tabName);
    if (index !== -1) {
      updateUrlForTab(tabName);

      // Scroll the tab into view
      setTimeout(() => {
        const container = tabsContainerRef.current;
        const tabElement = tabRefs.current.get(tabName);

        if (!container || !tabElement) {
          return;
        }

        // Find MUI's internal scroll container
        const scrollContainer = container.querySelector<HTMLElement>('.MuiTabs-scrollableX')
          || container.querySelector<HTMLElement>('[class*="scrollable"]');

        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const tabRect = tabElement.getBoundingClientRect();

          // Calculate scroll position needed to make tab fully visible
          const scrollLeft = scrollContainer.scrollLeft;
          const containerLeft = containerRect.left;
          const tabLeftRelativeToContainer = tabRect.left - containerLeft + scrollLeft;
          const tabRightRelativeToContainer = tabLeftRelativeToContainer + tabRect.width;

          // Account for dropdown button space
          const dropdownButtonSpace = 64;
          const visibleRight = containerRect.width - dropdownButtonSpace;

          let newScrollLeft = scrollLeft;

          // If tab is too far right, scroll it into view
          if (tabRightRelativeToContainer > visibleRight) {
            newScrollLeft = tabLeftRelativeToContainer - (containerRect.width - tabRect.width - dropdownButtonSpace);
          } else if (tabLeftRelativeToContainer < 0) {
            // If tab is too far left, scroll it into view
            newScrollLeft = tabLeftRelativeToContainer;
          }

          // Ensure scroll position is within bounds
          newScrollLeft = Math.max(0, Math.min(newScrollLeft, scrollContainer.scrollWidth - containerRect.width));

          scrollContainer.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
          });
        }
      }, 50);
    }
    handleMenuClose();
  };

  const menuOpen = Boolean(menuAnchorEl);

  // Show dropdown button on mobile when there are hidden tabs OR remaining tabs to add
  const showDropdownButton = isMobile && (hiddenTabs.length > 0 || remainingTabs.length > 0);

  // Show original Add Tab button on desktop when there are remaining tabs
  const showAddTabButton = !isMobile && remainingTabs.length > 0;

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

    // Tab index is derived from URL; no need to update when reordering (tab name stays the same)

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

    // Close dialog
    setRemoveTabDialogOpen(false);
    setTabToRemove(null);

    // Optimistic update: Update UI immediately
    onUpdateAsset({ ...asset, tabs: newTabs });

    // If we were viewing the removed tab, update URL to overview
    if (tabToRemove === assetTabs[currentTabIndex]) {
      updateUrlForTab('overview');
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
            onCalendarRefreshRequested={() => calendarRefreshRef.current?.()}
            onNavigateToTab={updateUrlForTab}
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
        return (
          <CalendarTab
            asset={asset}
            locale={locale}
            registerCalendarRefresh={registerCalendarRefresh}
          />
        );
      case 'timeline':
        return <TimelineTab asset={asset} />;
      case 'insights':
        return <ReportTab asset={asset} />;
      case 'finance':
        return <FinanceTab asset={asset} />;
      case 'docs':
        return (
          <DocsTab
            asset={asset}
            locale={locale}
            onUpdateAsset={onUpdateAsset}
          />
        );
      case 'gallery':
        return (
          <GalleryTab
            asset={asset}
            locale={locale}
            onUpdateAsset={onUpdateAsset}
          />
        );
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
      <Box
        ref={tabsContainerRef}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center', position: 'relative' }}
      >
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
              value={currentTabIndex}
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
                  tabRef={(element) => {
                    if (element) {
                      tabRefs.current.set(tabName, element);
                    } else {
                      tabRefs.current.delete(tabName);
                    }
                  }}
                />
              ))}
            </Tabs>
          </SortableContext>
        </DndContext>
        {showDropdownButton && (
          <IconButton
            ref={dropdownButtonRef}
            size="small"
            onClick={handleMenuOpen}
            sx={{
              'ml': 1,
              'color': theme.palette.mode === 'dark' ? 'text.secondary' : 'grey.600',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <MoreHorizIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
        {showAddTabButton && (
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

      {/* Dropdown Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* Hidden tabs */}
        {hiddenTabs.map(tabName => (
          <MenuItem
            key={tabName}
            onClick={() => handleMenuTabClick(tabName)}
            selected={assetTabs[currentTabIndex] === tabName}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getTabIcon(tabName, { fontSize: 20 })}
            </ListItemIcon>
            <ListItemText primary={t(`tabs_${tabName}` as any)} />
          </MenuItem>
        ))}

        {/* Divider if both hidden tabs and remaining tabs exist */}
        {hiddenTabs.length > 0 && remainingTabs.length > 0 && <Divider />}

        {/* Add Tab option */}
        {remainingTabs.length > 0 && (
          <MenuItem onClick={() => {
            handleMenuClose();
            setAddTabDialogOpen(true);
          }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AddIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText primary={t('add_tab')} />
          </MenuItem>
        )}
      </Menu>

      <Box>
        {assetTabs.map((tabName, index) => (
          <Box key={tabName} sx={{ display: currentTabIndex === index ? 'block' : 'none' }}>
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
