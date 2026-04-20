'use client';

import type { FinanceEntryData } from '@/entities';
import {
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
} from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Popover } from '@/components/common/Popover';
import { categoryLabel } from '@/components/Finance/financeEntryCategories';

type EntryDetailsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  anchorPosition?: { top: number; left: number } | null;
  entry: FinanceEntryData | null;
  onClose: () => void;
  onEdit: () => void;
  onDeleteClick: (anchorEl: HTMLElement) => void;
};

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amountCents / 100);
}

function formatDateString(value: string | null) {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString('en-GB');
}

function kindLabel(kind: FinanceEntryData['kind']) {
  if (kind === 'one_time') {
    return 'One-time';
  }
  if (kind === 'recurring') {
    return 'Recurring';
  }
  return 'Manual recurring';
}

export function EntryDetailsPopover({
  open,
  anchorEl,
  anchorPosition = null,
  entry,
  onClose,
  onEdit,
  onDeleteClick,
}: EntryDetailsPopoverProps) {
  const t = useTranslations('Assets');

  if (!entry) {
    return null;
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorPosition={anchorPosition}
      onClose={onClose}
      minWidth={320}
      maxWidth={340}
      showArrow={anchorPosition == null}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600}>{entry.name}</Typography>
            <Typography variant="caption" color="text.secondary">{t('finance_entry_details_title')}</Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" aria-label={t('finance_edit_entry')} onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label={t('finance_delete_entry')}
              color="error"
              onClick={e => onDeleteClick(e.currentTarget)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={1.25}>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('finance_metric_income')}</Typography>
            <Typography variant="body2" sx={{ color: entry.flow === 'income' ? 'success.main' : 'error.main' }}>
              {entry.flow}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <Typography variant="body2">{kindLabel(entry.kind)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Category</Typography>
            <Typography variant="body2">{categoryLabel(entry.category)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Amount</Typography>
            <Typography variant="body2">{formatCurrency(entry.amountCents)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Date range</Typography>
            <Typography variant="body2">
              {entry.kind === 'one_time'
                ? formatDateString(entry.effectiveDate)
                : `${formatDateString(entry.recurringStart)} - ${formatDateString(entry.recurringEnd)}`}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Attachments</Typography>
            <Typography variant="body2">{(entry.attachments ?? []).length}</Typography>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
}
