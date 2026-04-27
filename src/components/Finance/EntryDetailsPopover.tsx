'use client';

import type { FinanceEntryData } from '@/entities';
import {
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
} from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { Popover } from '@/components/common/Popover';
import { attachmentNounForCategory, categoryLabel } from '@/components/Finance/financeEntryCategories';
import { useGetUserPreferences } from '@/queries/hooks/users';

type EntryDetailsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  anchorPosition?: { top: number; left: number } | null;
  entry: FinanceEntryData | null;
  onClose: () => void;
  onEdit: () => void;
  onDeleteClick: (anchorEl: HTMLElement) => void;
};

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amountCents / 100);
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

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
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
  const locale = useLocale();
  const { data: userPreferences } = useGetUserPreferences(locale);
  const selectedCurrency = userPreferences?.currency ?? 'GBP';

  if (!entry) {
    return null;
  }
  const attachmentNoun = attachmentNounForCategory(entry.category);
  const attachmentLabel = attachmentNoun.charAt(0).toUpperCase() + attachmentNoun.slice(1);

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
            <Typography variant="body2">{formatCurrency(entry.amountCents, selectedCurrency)}</Typography>
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
            <Typography variant="caption" color="text.secondary">{attachmentLabel}</Typography>
            <Typography variant="body2">{(entry.attachments ?? []).length}</Typography>
          </Box>
          {entry.category === 'finance_agreement' && entry.financeAgreement && (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary">Provider</Typography>
                <Typography variant="body2">{entry.financeAgreement.provider}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total cash price</Typography>
                <Typography variant="body2">{formatCurrency(entry.financeAgreement.totalCashPriceCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Advance payments</Typography>
                <Typography variant="body2">{formatCurrency(entry.financeAgreement.advancePaymentsCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Duration</Typography>
                <Typography variant="body2">
                  {entry.financeAgreement.durationMonths}
                  {' '}
                  months (
                  {entry.financeAgreement.frequency}
                  )
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Amount of credit</Typography>
                <Typography variant="body2">{formatCurrency(entry.financeAgreement.amountOfCreditCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Interest charges</Typography>
                <Typography variant="body2">{formatCurrency(entry.financeAgreement.interestChargesCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Acceptance fee</Typography>
                <Typography variant="body2">{formatCurrency(entry.financeAgreement.acceptanceFeeCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Title transfer fee</Typography>
                <Typography variant="body2">{formatCurrency(entry.financeAgreement.titleTransferFeeCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total charge for credit</Typography>
                <Typography variant="body2">{formatCurrency(entry.financeAgreement.totalChargeForCreditCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total amount payable</Typography>
                <Typography variant="body2">{formatCurrency(entry.financeAgreement.totalAmountPayableCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Interest rate</Typography>
                <Typography variant="body2">{formatPercent(entry.financeAgreement.interestRatePercent)}</Typography>
              </Box>
            </>
          )}
          {entry.category === 'insurance' && entry.insurance && (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary">Provider</Typography>
                <Typography variant="body2">{entry.insurance.provider}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Premium</Typography>
                <Typography variant="body2">{formatCurrency(entry.insurance.premiumCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Frequency</Typography>
                <Typography variant="body2">{entry.insurance.frequency}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Insurance type</Typography>
                <Typography variant="body2">{entry.insurance.insuranceType ?? '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Valid from</Typography>
                <Typography variant="body2">{formatDateString(entry.insurance.validFrom)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Valid until</Typography>
                <Typography variant="body2">{formatDateString(entry.insurance.validUntil ?? null)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Policy number</Typography>
                <Typography variant="body2">{entry.insurance.policyNumber || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Insurer contact</Typography>
                <Typography variant="body2">{entry.insurance.insurerContact || '-'}</Typography>
              </Box>
            </>
          )}
          {entry.category === 'gas' && entry.gas && (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary">Value</Typography>
                <Typography variant="body2">{formatCurrency(entry.gas.valueCents, selectedCurrency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Litres</Typography>
                <Typography variant="body2">{entry.gas.litres.toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Price per litre</Typography>
                <Typography variant="body2">
                  {entry.gas.pricePerLitreCents != null ? formatCurrency(entry.gas.pricePerLitreCents, selectedCurrency) : '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <Typography variant="body2">{formatDateString(entry.gas.date)}</Typography>
              </Box>
            </>
          )}
          {entry.category === 'repair' && entry.repair && (
            <>
              <Box><Typography variant="caption" color="text.secondary">Value</Typography><Typography variant="body2">{formatCurrency(entry.repair.valueCents, selectedCurrency)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{formatDateString(entry.repair.date)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Provider</Typography><Typography variant="body2">{entry.repair.provider || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Repair type</Typography><Typography variant="body2">{entry.repair.repairType || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body2">{entry.repair.notes || '-'}</Typography></Box>
            </>
          )}
          {entry.category === 'tax' && entry.tax && (
            <>
              <Box><Typography variant="caption" color="text.secondary">Value</Typography><Typography variant="body2">{formatCurrency(entry.tax.valueCents, selectedCurrency)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Valid from</Typography><Typography variant="body2">{formatDateString(entry.tax.validFrom)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Valid until</Typography><Typography variant="body2">{formatDateString(entry.tax.validUntil ?? null)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Reference</Typography><Typography variant="body2">{entry.tax.reference || '-'}</Typography></Box>
            </>
          )}
          {entry.category === 'service' && entry.service && (
            <>
              <Box><Typography variant="caption" color="text.secondary">Value</Typography><Typography variant="body2">{formatCurrency(entry.service.valueCents, selectedCurrency)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{formatDateString(entry.service.date)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Provider</Typography><Typography variant="body2">{entry.service.provider || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Service type</Typography><Typography variant="body2">{entry.service.serviceType || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body2">{entry.service.notes || '-'}</Typography></Box>
            </>
          )}
          {entry.category === 'mot' && entry.mot && (
            <>
              <Box><Typography variant="caption" color="text.secondary">Value</Typography><Typography variant="body2">{formatCurrency(entry.mot.valueCents, selectedCurrency)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{formatDateString(entry.mot.date)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Result</Typography><Typography variant="body2">{entry.mot.result}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Provider</Typography><Typography variant="body2">{entry.mot.provider || '-'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body2">{entry.mot.notes || '-'}</Typography></Box>
            </>
          )}
          {entry.category === 'other' && entry.other && (
            <>
              <Box><Typography variant="caption" color="text.secondary">Value</Typography><Typography variant="body2">{formatCurrency(entry.other.valueCents, selectedCurrency)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{formatDateString(entry.other.date)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Direction</Typography><Typography variant="body2">{entry.other.direction}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Description</Typography><Typography variant="body2">{entry.other.description}</Typography></Box>
            </>
          )}
        </Stack>
      </Box>
    </Popover>
  );
}
