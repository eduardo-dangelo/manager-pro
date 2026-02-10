'use client';

import type { PopoverOrigin } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Box, Popover as MuiPopover } from '@mui/material';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

const ARROW_SIZE = 8;

const POPOVER_GAP = 8;

function getAnchorOrigin(
  anchorEl: HTMLElement | null,
  anchorWidth: number,
): { vertical: 'top' | 'center' | 'bottom'; horizontal: 'left' | 'center' | 'right' } {
  if (!anchorEl) {
    return { vertical: 'center', horizontal: 'left' };
  }
  if (typeof window === 'undefined') {
    return { vertical: 'center', horizontal: 'right' };
  }
  const rect = anchorEl.getBoundingClientRect();
  const spaceOnRight = window.innerWidth - rect.right;
  const spaceOnLeft = rect.left;
  const openToRight
    = spaceOnRight >= anchorWidth + POPOVER_GAP || spaceOnRight >= spaceOnLeft;
  return {
    vertical: 'center',
    horizontal: openToRight ? 'right' : 'left',
  };
}

function getTransformOrigin(anchorOrigin: PopoverOrigin): PopoverOrigin {
  return {
    vertical: 'center',
    horizontal: anchorOrigin.horizontal === 'right' ? 'left' : 'right',
  };
}

export type CommonPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
  disableRestoreFocus?: boolean;
  minWidth?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  paperSx?: SxProps<Theme>;
  showArrow?: boolean;
  /** Used for flip logic when width is 'auto'. Default 200. */
  anchorWidth?: number;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  /** When set, position popover at these viewport coordinates instead of anchorEl. Arrow is hidden. */
  anchorPosition?: { top: number; left: number } | null;
};

const POSITION_ANCHOR_ORIGIN: PopoverOrigin = { vertical: 'center', horizontal: 'left' };
const POSITION_TRANSFORM_ORIGIN: PopoverOrigin = { vertical: 'center', horizontal: 'left' };

export function Popover({
  open,
  anchorEl,
  onClose,
  children,
  disableRestoreFocus = true,
  minWidth,
  maxWidth,
  maxHeight,
  paperSx,
  showArrow = true,
  anchorWidth = 200,
  anchorOrigin: anchorOriginOverride,
  transformOrigin: transformOriginOverride,
  anchorPosition,
}: CommonPopoverProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [arrowTop, setArrowTop] = useState<number | null>(null);
  const usePositionAnchor = anchorPosition != null;

  const computeArrowTop = useCallback(() => {
    if (!anchorEl || !contentRef.current?.parentElement) {
      return;
    }
    const paper = contentRef.current.parentElement;
    const anchorRect = anchorEl.getBoundingClientRect();
    const paperRect = paper.getBoundingClientRect();
    if (paperRect.height <= 0) {
      return;
    }
    const anchorCenterY = anchorRect.top + anchorRect.height / 2;
    let top = anchorCenterY - paperRect.top;
    top = Math.max(ARROW_SIZE, Math.min(paperRect.height - ARROW_SIZE, top));
    setArrowTop(top);
  }, [anchorEl]);

  useLayoutEffect(() => {
    if (!open || !anchorEl || !showArrow || usePositionAnchor) {
      setArrowTop(null);
      return;
    }
    computeArrowTop();
    const handleResize = () => computeArrowTop();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, anchorEl, showArrow, usePositionAnchor, computeArrowTop]);

  const effectiveAnchorWidth = useMemo(() => {
    if (typeof maxWidth === 'number') {
      return maxWidth;
    }
    if (typeof minWidth === 'number') {
      return minWidth;
    }
    return anchorWidth;
  }, [maxWidth, minWidth, anchorWidth]);

  const anchorOrigin = useMemo(() => {
    if (usePositionAnchor) {
      return POSITION_ANCHOR_ORIGIN;
    }
    if (anchorOriginOverride) {
      return anchorOriginOverride;
    }
    if (!open || !anchorEl) {
      return { vertical: 'center' as const, horizontal: 'left' as const };
    }
    return getAnchorOrigin(anchorEl, effectiveAnchorWidth);
  }, [usePositionAnchor, anchorOriginOverride, open, anchorEl, effectiveAnchorWidth]);

  const transformOrigin = useMemo(() => {
    if (usePositionAnchor) {
      return POSITION_TRANSFORM_ORIGIN;
    }
    if (transformOriginOverride) {
      return transformOriginOverride;
    }
    return getTransformOrigin(anchorOrigin);
  }, [usePositionAnchor, transformOriginOverride, anchorOrigin]);

  const effectiveShowArrow = showArrow && !usePositionAnchor;

  const paperSxResolved = useMemo((): SxProps<Theme> => {
    const isAutoWidth = minWidth === 'auto' && maxWidth === 'auto';
    const base: SxProps<Theme> = {
      borderRadius: 2,
      marginLeft: usePositionAnchor ? `${POPOVER_GAP}px` : (anchorOrigin.horizontal === 'right' ? `${POPOVER_GAP}px` : undefined),
      marginRight: usePositionAnchor ? undefined : (anchorOrigin.horizontal === 'left' ? `${POPOVER_GAP}px` : undefined),
      ...(isAutoWidth && { width: 'fit-content' }),
      ...(minWidth != null && { minWidth }),
      ...(maxWidth != null && { maxWidth }),
      ...(maxHeight != null && { maxHeight }),
    };
    if (effectiveShowArrow) {
      const arrowTopValue = arrowTop != null ? `${arrowTop}px` : '50%';
      return ((theme: Theme) => ({
        ...base,
        'position': 'relative',
        'overflow': 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: arrowTopValue,
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          transition: 'top 0.2s ease-in-out',
          ...(anchorOrigin.horizontal === 'right'
            ? {
                left: -ARROW_SIZE,
                borderTop: `${ARROW_SIZE}px solid transparent`,
                borderBottom: `${ARROW_SIZE}px solid transparent`,
                borderRight: `${ARROW_SIZE}px solid ${theme.palette.mode === 'dark' ? 'rgba(63,63,63, 1)' : theme.palette.background.paper}`,
              }
            : {
                right: -ARROW_SIZE,
                borderTop: `${ARROW_SIZE}px solid transparent`,
                borderBottom: `${ARROW_SIZE}px solid transparent`,
                borderLeft: `${ARROW_SIZE}px solid ${theme.palette.mode === 'dark' ? 'rgba(63,63,63, 1)' : theme.palette.background.paper}`,
              }),
        },
        ...(typeof paperSx === 'function' ? paperSx(theme) : paperSx),
      })) as SxProps<Theme>;
    }
    return typeof paperSx === 'function'
      ? (theme: Theme) => ({ ...base, ...paperSx(theme) })
      : { ...base, ...paperSx };
  }, [effectiveShowArrow, anchorOrigin.horizontal, usePositionAnchor, arrowTop, minWidth, maxWidth, maxHeight, paperSx]);

  return (
    <MuiPopover
      open={open}
      anchorEl={usePositionAnchor ? null : anchorEl}
      anchorReference={usePositionAnchor ? 'anchorPosition' : 'anchorEl'}
      anchorPosition={usePositionAnchor ? anchorPosition ?? undefined : undefined}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          sx: paperSxResolved,
        },
        transition: {
          onEntered: () => {
            if (effectiveShowArrow) {
              computeArrowTop();
            }
          },
        },
      }}
      disableRestoreFocus={disableRestoreFocus}
    >
      <Box ref={contentRef} sx={{ width: '100%', minHeight: 0 }}>
        {children}
      </Box>
    </MuiPopover>
  );
}

Popover.displayName = 'Popover';
