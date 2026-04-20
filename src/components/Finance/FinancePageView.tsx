'use client';

import type { BarSeries, LineSeries } from '@mui/x-charts';
import type { MarkElementProps } from '@mui/x-charts/LineChart';
import type { Resolver } from 'react-hook-form';
import type { FilePreviewItem } from '@/components/Assets/Asset/tabs/FilePreviewPopover';
import type { CategoryOption } from '@/components/Finance/financeEntryCategories';
import type { FinanceEntryAttachment, FinanceEntryData, FinanceEntryFlow, FinanceEntryKind } from '@/entities';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import { useInteractionItemProps } from '@mui/x-charts/internals';
import { useTranslations } from 'next-intl';
import { createContext, use, useCallback, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { DocsPreviewDialog } from '@/components/Assets/Asset/tabs/docs/DocsPreviewDialog';
import { EVENT_COLORS } from '@/components/Calendar/constants';
import { YearPickerPopover } from '@/components/Calendar/YearPickerPopover';
import { Card } from '@/components/common/Card';
import { ConfirmPopover } from '@/components/common/ConfirmPopover';
import { Popover } from '@/components/common/Popover';
import { EntryDetailsPopover } from '@/components/Finance/EntryDetailsPopover';
import {
  aggregateMonthlyTotals,
  buildEntryMonthlySeries,
  buildFutureMonthFlags,
  intersectsYear,
  sumMonthlyCentsWithFutureMask,
} from '@/components/Finance/financeAggregations';
import { getDefaultFinanceColor } from '@/components/Finance/financeDefaultColors';
import { categoryLabel, getCategoryOptions } from '@/components/Finance/financeEntryCategories';
import { useGetAssets as useGetAssetsList } from '@/queries/hooks/assets/useGetAssets';
import { useCreateFinanceEntry, useDeleteFinanceEntry, useFinanceEntries, useUpdateFinanceEntry } from '@/queries/hooks/finance-entries';

type FinancePageViewProps = {
  locale: string;
  assetId?: number;
  assetName?: string;
  /** When set (e.g. asset tab), drives category presets. Global view resolves from selected asset. */
  assetType?: string | null;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isCustomColor(color: string) {
  return !EVENT_COLORS.some(c => c.value === color) && color.startsWith('#');
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amountCents / 100);
}

function formatDateString(value: string | null) {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString('en-GB');
}

const ATTACHMENT_NAME_MAX_LEN = 22;
/** Net cumulative line series id — must match custom mark and area fill styling. */
const LINE_NET_TOTAL_ID = 'finance-net-total';
/** Area fill opacity for entry lines (stroke/legend stay full `s.color`). */
const LINE_ENTRY_AREA_FILL_ALPHA = 0.22;

/** Running sum of monthly cents (integer cents at each month). */
function cumulativeCentsFromMonthlyCents(monthlyCents: number[]): number[] {
  let sum = 0;
  return monthlyCents.map((c) => {
    sum += c;
    return sum;
  });
}

const FinanceLineNetLabelsContext = createContext<readonly number[]>([]);

/** Custom line marks: default circle + cumulative net labels on the net total series. */
function FinanceLineMark(props: MarkElementProps) {
  const th = useTheme();
  const cumulativeNetCents = use(FinanceLineNetLabelsContext);
  const interactionProps = useInteractionItemProps({
    type: 'line',
    seriesId: props.id,
    dataIndex: props.dataIndex,
  });
  const { id, x, y, color, dataIndex, hidden, isFaded, onClick } = props;
  const cx = Number(x ?? 0);
  const cy = Number(y ?? 0);
  const strokeColor = color ?? th.palette.grey[600];
  const bg = (th.vars ?? th).palette.background.paper;
  const netAt = cumulativeNetCents[dataIndex];
  const showLabel = id === LINE_NET_TOTAL_ID && netAt !== undefined;
  const labelText = showLabel ? formatCurrency(netAt) : null;
  const fadedOpacity = isFaded ? 0.3 : 1;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={bg}
        stroke={strokeColor}
        strokeWidth={2}
        opacity={hidden ? 0 : fadedOpacity}
        cursor={onClick ? 'pointer' : 'unset'}
        pointerEvents={hidden ? 'none' : undefined}
        data-highlighted={props.isHighlighted || undefined}
        data-faded={isFaded || undefined}
        onClick={onClick}
        {...interactionProps}
      />
      {labelText != null && !hidden && (
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fontSize={11}
          fill={th.palette.text.secondary}
          pointerEvents="none"
        >
          {labelText}
        </text>
      )}
    </g>
  );
}

function truncateAttachmentName(name: string, maxLen = ATTACHMENT_NAME_MAX_LEN): string {
  if (name.length <= maxLen) {
    return name;
  }
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) {
    const stem = name.slice(0, -4);
    const suffix = '….pdf';
    if (stem.length + suffix.length <= maxLen) {
      return name;
    }
    const keepStem = Math.max(1, maxLen - suffix.length);
    return `${stem.slice(0, keepStem)}${suffix}`;
  }
  const dot = name.lastIndexOf('.');
  if (dot > 0) {
    const stem = name.slice(0, dot);
    const ext = name.slice(dot);
    const suffix = `…${ext}`;
    const keepStem = Math.max(1, maxLen - suffix.length);
    return `${stem.slice(0, keepStem)}${suffix}`;
  }
  return `${name.slice(0, Math.max(1, maxLen - 1))}…`;
}

function kindLabel(kind: FinanceEntryKind) {
  if (kind === 'one_time') {
    return 'One-time';
  }
  if (kind === 'recurring') {
    return 'Recurring';
  }
  return 'Manual recurring';
}

function dateInputToIso(dateStr: string | undefined | null) {
  if (!dateStr) {
    return null;
  }
  return new Date(`${dateStr}T12:00:00`).toISOString();
}

function isoToDateInput(value: string | null | undefined) {
  if (!value) {
    return '';
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toISOString().slice(0, 10);
}

function sumManualForYear(entry: FinanceEntryData, year: number): number {
  if (!entry.manualAmounts) {
    return 0;
  }
  let sum = 0;
  for (let m = 0; m < 12; m++) {
    const key = `${year}-${String(m + 1).padStart(2, '0')}`;
    sum += entry.manualAmounts[key] ?? 0;
  }
  return sum;
}

function replaceYearManualAmounts(
  prev: FinanceEntryData['manualAmounts'],
  year: number,
  monthValuesPounds: number[],
): Record<string, number> {
  const next: Record<string, number> = { ...(prev ?? {}) };
  for (let m = 0; m < 12; m++) {
    const key = `${year}-${String(m + 1).padStart(2, '0')}`;
    delete next[key];
  }
  for (let m = 0; m < 12; m++) {
    const pounds = monthValuesPounds[m] ?? 0;
    if (pounds > 0) {
      const key = `${year}-${String(m + 1).padStart(2, '0')}`;
      next[key] = Math.round(pounds * 100);
    }
  }
  return next;
}

const financeFormSchema = z.object({
  assetId: z.number().int().positive().optional(),
  category: z.string().optional(),
  name: z.string().trim().min(1, 'Name is required'),
  kind: z.enum(['one_time', 'recurring', 'manual_recurring']),
  flow: z.enum(['income', 'expense']),
  amount: z.number().min(0),
  effectiveDate: z.string().optional(),
  recurringStart: z.string().optional(),
  recurringEnd: z.string().optional(),
  initialAmount: z.number().min(0).optional(),
  initialDate: z.string().optional(),
}).superRefine((v, ctx) => {
  if (v.kind === 'one_time') {
    if (!v.effectiveDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Date is required', path: ['effectiveDate'] });
    }
    if (v.amount <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Amount must be greater than 0', path: ['amount'] });
    }
  } else if (v.kind === 'recurring') {
    if (!v.recurringStart) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Recurring start is required', path: ['recurringStart'] });
    }
    if (v.amount <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Amount must be greater than 0', path: ['amount'] });
    }
  } else {
    if (!v.recurringStart) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Recurring start is required', path: ['recurringStart'] });
    }
  }
});

type FinanceFormValues = {
  assetId?: number;
  category?: string;
  name: string;
  kind: 'one_time' | 'recurring' | 'manual_recurring';
  flow: 'income' | 'expense';
  amount: number;
  effectiveDate?: string;
  recurringStart?: string;
  recurringEnd?: string;
  initialAmount?: number;
  initialDate?: string;
};

export function FinancePageView({ locale, assetId, assetName: _assetName, assetType: assetTypeProp }: FinancePageViewProps) {
  const t = useTranslations('Assets');
  const theme = useTheme();
  const [yearDate, setYearDate] = useState(() => new Date(new Date().getFullYear(), 0, 1));
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null);
  const [addStep, setAddStep] = useState<'category' | 'form'>('category');
  const [globalPickedAssetId, setGlobalPickedAssetId] = useState<number | undefined>(undefined);
  const [financeColor, setFinanceColor] = useState('#22c55e');
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [attachmentsDraft, setAttachmentsDraft] = useState<FinanceEntryAttachment[]>([]);
  const [includeInitial, setIncludeInitial] = useState(false);
  const [manualMonthsPounds, setManualMonthsPounds] = useState<number[]>(() => Array.from({ length: 12 }, () => 0));
  const [chartStacked, setChartStacked] = useState(false);
  const [showExpense, setShowExpense] = useState(true);
  const [showIncome, setShowIncome] = useState(true);
  const [previewItem, setPreviewItem] = useState<FilePreviewItem | null>(null);
  const [monthEditEntry, setMonthEditEntry] = useState<FinanceEntryData | null>(null);
  const [monthEditValues, setMonthEditValues] = useState<number[]>(Array.from({ length: 12 }, () => 0));
  const [rowColorEntry, setRowColorEntry] = useState<FinanceEntryData | null>(null);
  const [rowColorAnchor, setRowColorAnchor] = useState<HTMLElement | null>(null);
  const [entryDetailsEntry, setEntryDetailsEntry] = useState<FinanceEntryData | null>(null);
  const [entryDetailsAnchor, setEntryDetailsAnchor] = useState<HTMLElement | null>(null);
  const [entryDetailsAnchorPosition, setEntryDetailsAnchorPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteConfirmAnchor, setDeleteConfirmAnchor] = useState<HTMLElement | null>(null);
  const [editingEntry, setEditingEntry] = useState<FinanceEntryData | null>(null);

  const selectedYear = yearDate.getFullYear();

  const { data: entries = [] } = useFinanceEntries({
    locale,
    assetId,
    year: selectedYear,
  });
  const { data: assets = [] } = useGetAssetsList(locale);
  const createFinanceEntry = useCreateFinanceEntry(locale);
  const deleteFinanceEntry = useDeleteFinanceEntry(locale);
  const updateFinanceEntry = useUpdateFinanceEntry(locale);

  const resolvedAssetIdForScope = assetId ?? globalPickedAssetId;

  const entriesForYear = useMemo(
    () => entries.filter(entry => intersectsYear(entry, selectedYear)),
    [entries, selectedYear],
  );
  const monthlyTotals = useMemo(
    () => aggregateMonthlyTotals(entriesForYear, selectedYear),
    [entriesForYear, selectedYear],
  );
  const entrySeries = useMemo(
    () => buildEntryMonthlySeries(entriesForYear, selectedYear),
    [entriesForYear, selectedYear],
  );
  const incomeSeries = useMemo(
    () => entrySeries.filter(s => s.flow === 'income'),
    [entrySeries],
  );
  const expenseSeries = useMemo(
    () => entrySeries.filter(s => s.flow === 'expense'),
    [entrySeries],
  );

  const visibleEntriesForYear = useMemo(
    () => entriesForYear.filter(entry => (entry.flow === 'income' ? showIncome : showExpense)),
    [entriesForYear, showIncome, showExpense],
  );
  const visibleIncomeSeries = useMemo(
    () => (showIncome ? incomeSeries : []),
    [incomeSeries, showIncome],
  );
  const visibleExpenseSeries = useMemo(
    () => (showExpense ? expenseSeries : []),
    [expenseSeries, showExpense],
  );
  const visibleEntrySeries = useMemo(
    () => [...visibleIncomeSeries, ...visibleExpenseSeries],
    [visibleIncomeSeries, visibleExpenseSeries],
  );
  const visibleMonthlyTotals = useMemo(
    () => ({
      income: showIncome ? monthlyTotals.income : Array.from({ length: 12 }, () => 0),
      expense: showExpense ? monthlyTotals.expense : Array.from({ length: 12 }, () => 0),
    }),
    [showIncome, showExpense, monthlyTotals.income, monthlyTotals.expense],
  );

  const futureMonthFlags = useMemo(
    () => buildFutureMonthFlags(selectedYear, new Date()),
    [selectedYear],
  );
  const yearlyIncomeYtd = sumMonthlyCentsWithFutureMask(visibleMonthlyTotals.income, futureMonthFlags, 'realized');
  const yearlyExpenseYtd = sumMonthlyCentsWithFutureMask(visibleMonthlyTotals.expense, futureMonthFlags, 'realized');
  const netYtd = yearlyIncomeYtd - yearlyExpenseYtd;
  const realizedMonthCount = useMemo(
    () => futureMonthFlags.reduce((count, isFuture) => (isFuture ? count : count + 1), 0),
    [futureMonthFlags],
  );
  const avgIncomeRealized = realizedMonthCount > 0 ? Math.round(yearlyIncomeYtd / realizedMonthCount) : 0;
  const avgExpenseRealized = realizedMonthCount > 0 ? Math.round(yearlyExpenseYtd / realizedMonthCount) : 0;
  const avgNetRealized = realizedMonthCount > 0 ? Math.round(netYtd / realizedMonthCount) : 0;
  const projectedMonthlyTotals = useMemo(() => {
    const income = Array.from({ length: 12 }, (_, monthIndex) => {
      if (!futureMonthFlags[monthIndex]) {
        return visibleMonthlyTotals.income[monthIndex] ?? 0;
      }
      const hasExplicit = visibleEntrySeries.some(series => (series.monthlyCents[monthIndex] ?? 0) !== 0);
      return hasExplicit ? (visibleMonthlyTotals.income[monthIndex] ?? 0) : avgIncomeRealized;
    });
    const expense = Array.from({ length: 12 }, (_, monthIndex) => {
      if (!futureMonthFlags[monthIndex]) {
        return visibleMonthlyTotals.expense[monthIndex] ?? 0;
      }
      const hasExplicit = visibleEntrySeries.some(series => (series.monthlyCents[monthIndex] ?? 0) !== 0);
      return hasExplicit ? (visibleMonthlyTotals.expense[monthIndex] ?? 0) : avgExpenseRealized;
    });
    return { income, expense };
  }, [futureMonthFlags, visibleMonthlyTotals.income, visibleMonthlyTotals.expense, visibleEntrySeries, avgIncomeRealized, avgExpenseRealized]);
  const projectedIncome = projectedMonthlyTotals.income.reduce((sum, value) => sum + value, 0);
  const projectedExpense = projectedMonthlyTotals.expense.reduce((sum, value) => sum + value, 0);
  const projectedNet = projectedIncome - projectedExpense;

  const pieSeriesData = useMemo(
    () => visibleEntrySeries
      .map(s => ({
        id: String(s.entryId),
        label: s.name,
        value: s.monthlyCents.reduce((a, b) => a + b, 0) / 100,
        color: s.color,
      }))
      .filter(d => d.value > 0),
    [visibleEntrySeries],
  );

  const resolvedAssetType = useMemo(() => {
    if (assetTypeProp) {
      return assetTypeProp;
    }
    if (resolvedAssetIdForScope) {
      return assets.find(a => a.id === resolvedAssetIdForScope)?.type ?? null;
    }
    return null;
  }, [assetTypeProp, resolvedAssetIdForScope, assets]);

  const categoryOptions = useMemo(
    () => getCategoryOptions(resolvedAssetType ?? undefined),
    [resolvedAssetType],
  );

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FinanceFormValues>({
    resolver: zodResolver(financeFormSchema) as Resolver<FinanceFormValues>,
    defaultValues: {
      assetId,
      category: undefined,
      kind: 'one_time',
      flow: 'income',
      amount: 0,
      name: '',
      effectiveDate: new Date().toISOString().slice(0, 10),
      recurringStart: new Date().toISOString().slice(0, 10),
      recurringEnd: '',
      initialAmount: 0,
      initialDate: new Date().toISOString().slice(0, 10),
    },
  });
  const kind = watch('kind');
  const formAssetId = watch('assetId');

  const assetLookup = useMemo(
    () => new Map(assets.map(item => [item.id, item.name || `Asset ${item.id}`])),
    [assets],
  );

  const openAddFromEvent = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAddStep('category');
    setGlobalPickedAssetId(assetId);
    setAttachmentsDraft([]);
    setIncludeInitial(false);
    setManualMonthsPounds(Array.from({ length: 12 }, () => 0));
    setAddAnchor(e.currentTarget);
  }, [assetId]);

  const applyCategoryPreset = useCallback((opt: CategoryOption) => {
    const flow = opt.defaults.flow;
    const ord = entriesForYear.filter(e => e.flow === flow).length;
    const nextColor = getDefaultFinanceColor(flow, ord);
    setFinanceColor(nextColor);
    setAttachmentsDraft([]);
    setIncludeInitial(false);
    setManualMonthsPounds(Array.from({ length: 12 }, () => 0));
    reset({
      assetId: assetId ?? globalPickedAssetId ?? formAssetId,
      category: opt.key,
      name: opt.defaults.name,
      kind: opt.defaults.kind,
      flow,
      amount: 0,
      effectiveDate: new Date().toISOString().slice(0, 10),
      recurringStart: new Date().toISOString().slice(0, 10),
      recurringEnd: '',
      initialAmount: 0,
      initialDate: new Date().toISOString().slice(0, 10),
    });
    setAddStep('form');
  }, [assetId, globalPickedAssetId, formAssetId, entriesForYear, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const resolvedAssetId = assetId ?? globalPickedAssetId ?? values.assetId;
    if (!resolvedAssetId) {
      return;
    }

    const manualAmounts: Record<string, number> = {};
    if (values.kind === 'manual_recurring') {
      manualMonthsPounds.forEach((pounds, m) => {
        if (pounds > 0) {
          const key = `${selectedYear}-${String(m + 1).padStart(2, '0')}`;
          manualAmounts[key] = Math.round(pounds * 100);
        }
      });
    }

    const amountCents = values.kind === 'manual_recurring' && values.amount <= 0
      ? 0
      : Math.round(values.amount * 100);

    const colorHex = financeColor.startsWith('#') || financeColor.startsWith('hsl')
      ? financeColor
      : (EVENT_COLORS.find(c => c.value === financeColor)?.hex ?? financeColor);

    const payload: Parameters<typeof createFinanceEntry.mutateAsync>[0] = {
      assetId: resolvedAssetId,
      name: values.name.trim(),
      kind: values.kind as FinanceEntryKind,
      flow: values.flow as FinanceEntryFlow,
      amountCents,
      category: values.category ?? null,
      color: colorHex,
      attachments: attachmentsDraft.length > 0 ? attachmentsDraft : null,
      manualAmounts: values.kind === 'manual_recurring' ? manualAmounts : null,
      initialAmountCents: includeInitial && values.kind === 'manual_recurring' && (values.initialAmount ?? 0) > 0
        ? Math.round((values.initialAmount ?? 0) * 100)
        : null,
      initialEffectiveDate:
        includeInitial && values.kind === 'manual_recurring' && (values.initialAmount ?? 0) > 0 && values.initialDate
          ? dateInputToIso(values.initialDate)
          : null,
    };

    if (values.kind === 'one_time') {
      payload.effectiveDate = dateInputToIso(values.effectiveDate);
    } else {
      payload.recurringFrequency = 'monthly';
      payload.recurringStart = dateInputToIso(values.recurringStart);
      payload.recurringEnd = values.recurringEnd ? dateInputToIso(values.recurringEnd) : null;
    }

    if (editingEntry) {
      const updatePayload: Parameters<typeof updateFinanceEntry.mutateAsync>[0] = {
        id: editingEntry.id,
        name: values.name.trim(),
        kind: values.kind as FinanceEntryKind,
        flow: values.flow as FinanceEntryFlow,
        amountCents,
        category: values.category ?? null,
        color: colorHex,
        attachments: attachmentsDraft.length > 0 ? attachmentsDraft : null,
        manualAmounts: values.kind === 'manual_recurring' ? manualAmounts : null,
      };
      if (values.kind === 'one_time') {
        updatePayload.effectiveDate = dateInputToIso(values.effectiveDate);
        updatePayload.recurringFrequency = null;
        updatePayload.recurringStart = null;
        updatePayload.recurringEnd = null;
      } else {
        updatePayload.effectiveDate = null;
        updatePayload.recurringFrequency = 'monthly';
        updatePayload.recurringStart = dateInputToIso(values.recurringStart);
        updatePayload.recurringEnd = values.recurringEnd ? dateInputToIso(values.recurringEnd) : null;
      }
      await updateFinanceEntry.mutateAsync(updatePayload);
    } else {
      await createFinanceEntry.mutateAsync(payload);
    }
    setAddAnchor(null);
    setAddStep('category');
    setEditingEntry(null);
  });

  const openEntryDetails = useCallback((entry: FinanceEntryData, anchor: HTMLElement, position: { top: number; left: number }) => {
    setEntryDetailsEntry(entry);
    setEntryDetailsAnchor(anchor);
    setEntryDetailsAnchorPosition(position);
  }, []);

  const closeEntryDetails = useCallback(() => {
    setEntryDetailsEntry(null);
    setEntryDetailsAnchor(null);
    setEntryDetailsAnchorPosition(null);
    setDeleteConfirmAnchor(null);
  }, []);

  const openEditEntryForm = useCallback(() => {
    if (!entryDetailsEntry || !entryDetailsAnchor) {
      return;
    }
    setEditingEntry(entryDetailsEntry);
    setFinanceColor(entryDetailsEntry.color ?? getDefaultFinanceColor(entryDetailsEntry.flow, 0));
    setAttachmentsDraft(entryDetailsEntry.attachments ?? []);
    setIncludeInitial(false);
    const nextManual = entryDetailsEntry.kind === 'manual_recurring'
      ? Array.from({ length: 12 }, (_, m) => {
          const key = `${selectedYear}-${String(m + 1).padStart(2, '0')}`;
          return (entryDetailsEntry.manualAmounts?.[key] ?? 0) / 100;
        })
      : Array.from({ length: 12 }, () => 0);
    setManualMonthsPounds(nextManual);
    reset({
      assetId: entryDetailsEntry.assetId,
      category: entryDetailsEntry.category ?? undefined,
      name: entryDetailsEntry.name,
      kind: entryDetailsEntry.kind,
      flow: entryDetailsEntry.flow,
      amount: entryDetailsEntry.amountCents / 100,
      effectiveDate: isoToDateInput(entryDetailsEntry.effectiveDate) || new Date().toISOString().slice(0, 10),
      recurringStart: isoToDateInput(entryDetailsEntry.recurringStart) || new Date().toISOString().slice(0, 10),
      recurringEnd: isoToDateInput(entryDetailsEntry.recurringEnd),
      initialAmount: 0,
      initialDate: new Date().toISOString().slice(0, 10),
    });
    setGlobalPickedAssetId(entryDetailsEntry.assetId);
    setAddAnchor(entryDetailsAnchor);
    setAddStep('form');
    closeEntryDetails();
  }, [entryDetailsEntry, entryDetailsAnchor, selectedYear, reset, closeEntryDetails]);

  const confirmDeleteEntry = useCallback(async () => {
    if (!entryDetailsEntry) {
      return;
    }
    await deleteFinanceEntry.mutateAsync({ id: entryDetailsEntry.id });
    closeEntryDetails();
  }, [entryDetailsEntry, deleteFinanceEntry, closeEntryDetails]);

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const aid = assetId ?? globalPickedAssetId ?? formAssetId;
    if (!file || !aid) {
      e.target.value = '';
      return;
    }
    try {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('type', 'docs');
      const res = await fetch(`/${locale}/api/assets/${aid}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      const uploaded = (await res.json()) as FilePreviewItem;
      setAttachmentsDraft(prev => [...prev, { id: uploaded.id, name: uploaded.name, url: uploaded.url }]);
    } catch {
      // keep UI quiet; could toast
    } finally {
      e.target.value = '';
    }
  };

  const openMonthEditor = (entry: FinanceEntryData) => {
    if (entry.kind !== 'manual_recurring') {
      return;
    }
    const next = Array.from({ length: 12 }, (_, m) => {
      const key = `${selectedYear}-${String(m + 1).padStart(2, '0')}`;
      const cents = entry.manualAmounts?.[key] ?? 0;
      return cents / 100;
    });
    setMonthEditValues(next);
    setMonthEditEntry(entry);
  };

  const saveMonthEditor = async () => {
    if (!monthEditEntry) {
      return;
    }
    const merged = replaceYearManualAmounts(monthEditEntry.manualAmounts, selectedYear, monthEditValues);
    await updateFinanceEntry.mutateAsync({
      id: monthEditEntry.id,
      manualAmounts: merged,
    });
    setMonthEditEntry(null);
  };

  const patchEntryColor = async (entry: FinanceEntryData, hex: string) => {
    await updateFinanceEntry.mutateAsync({ id: entry.id, color: hex });
    setRowColorEntry(null);
    setRowColorAnchor(null);
  };

  const toBarSeries = (
    seriesList: ReturnType<typeof buildEntryMonthlySeries>,
    stacked: boolean,
    stackId: string,
    labelSuffix: '' | 'income' | 'expense',
  ): BarSeries[] => {
    const suffix = labelSuffix === '' ? '' : ` (${labelSuffix})`;
    return seriesList.map(s => ({
      id: `e${s.entryId}-${labelSuffix || 'x'}`,
      type: 'bar' as const,
      data: s.monthlyCents.map(c => c / 100),
      label: `${s.name}${suffix}`,
      color: s.color,
      stack: stacked ? stackId : undefined,
    }));
  };

  const combinedBarSeries = useMemo((): BarSeries[] => {
    const bothFlows = visibleIncomeSeries.length > 0 && visibleExpenseSeries.length > 0;
    return [
      ...toBarSeries(
        visibleIncomeSeries,
        chartStacked,
        'incomeStack',
        bothFlows ? 'income' : '',
      ),
      ...toBarSeries(
        visibleExpenseSeries,
        chartStacked,
        'expenseStack',
        bothFlows ? 'expense' : '',
      ),
    ];
  }, [visibleIncomeSeries, visibleExpenseSeries, chartStacked]);

  const netMonthlyCents = useMemo(
    () => visibleMonthlyTotals.expense.map((e, i) => e - (visibleMonthlyTotals.income[i] ?? 0)),
    [visibleMonthlyTotals.expense, visibleMonthlyTotals.income],
  );
  const cumulativeNetCents = useMemo(
    () => cumulativeCentsFromMonthlyCents(netMonthlyCents),
    [netMonthlyCents],
  );
  /** When cumulative (expense − income) is negative (profit), plot positive magnitude. */
  const chartCumulativeNetPounds = useMemo(
    () => cumulativeNetCents.map(c => (c < 0 ? -c : c) / 100),
    [cumulativeNetCents],
  );
  const cumulativeNetCentsForChartMarks = useMemo(
    () => cumulativeNetCents.map(c => (c < 0 ? -c : c)),
    [cumulativeNetCents],
  );
  const netCumulativeLineLabel = useMemo(() => {
    const yearEndCents = cumulativeNetCents[11] ?? 0;
    return yearEndCents < 0 ? t('finance_line_cumulative_profit') : t('finance_line_cumulative_outflow');
  }, [cumulativeNetCents, t]);

  const combinedLineSeries = useMemo((): LineSeries[] => {
    if (entriesForYear.length === 0) {
      return [];
    }
    const yearEndCents = cumulativeNetCents[11] ?? 0;
    const dualFlow = showIncome && showExpense;
    const invertIncome = dualFlow && yearEndCents > 0;
    const invertExpense = dualFlow && yearEndCents < 0;
    const incomeStackId = chartStacked ? 'incomeFlow' : undefined;
    const expenseStackId = chartStacked ? 'expenseFlow' : undefined;
    const incomeLines: LineSeries[] = showIncome
      ? visibleIncomeSeries.map(s => ({
          type: 'line',
          id: `linc-${s.entryId}`,
          label: s.name,
          data: s.monthlyCents.map(c => (invertIncome ? -c : c) / 100),
          area: true,
          stack: incomeStackId,
          curve: 'catmullRom',
          showMark: true,
          color: s.color,
        }))
      : [];
    const expenseLines: LineSeries[] = showExpense
      ? visibleExpenseSeries.map(s => ({
          type: 'line',
          id: `lexp-${s.entryId}`,
          label: s.name,
          data: s.monthlyCents.map(c => (invertExpense ? -c : c) / 100),
          area: true,
          stack: expenseStackId,
          curve: 'catmullRom',
          showMark: true,
          color: s.color,
        }))
      : [];
    const totalLine: LineSeries = {
      type: 'line',
      id: LINE_NET_TOTAL_ID,
      label: netCumulativeLineLabel,
      data: chartCumulativeNetPounds,
      area: true,
      curve: 'monotoneX',
      stack: undefined,
      showMark: true,
      color: theme.palette.grey[600],
    };
    return [...incomeLines, ...expenseLines, totalLine];
  }, [
    entriesForYear.length,
    visibleIncomeSeries,
    visibleExpenseSeries,
    chartStacked,
    showExpense,
    showIncome,
    cumulativeNetCents,
    chartCumulativeNetPounds,
    netCumulativeLineLabel,
    theme.palette.grey,
  ]);

  const lineChartEntryAreaFillSx = useMemo(() => {
    const next: Record<string, { fill: string }> = {};
    const addFill = (seriesId: string, color: string) => {
      next[`& path[data-series="${seriesId}"][fill]:not([fill="none"])`] = {
        fill: `${alpha(color, LINE_ENTRY_AREA_FILL_ALPHA)} !important`,
      };
    };
    if (showIncome) {
      for (const s of visibleIncomeSeries) {
        addFill(`linc-${s.entryId}`, s.color);
      }
    }
    if (showExpense) {
      for (const s of visibleExpenseSeries) {
        addFill(`lexp-${s.entryId}`, s.color);
      }
    }
    return next;
  }, [showIncome, showExpense, visibleIncomeSeries, visibleExpenseSeries]);

  const hasEntries = entriesForYear.length > 0;
  const hasAnyBarSeries = visibleIncomeSeries.length > 0 || visibleExpenseSeries.length > 0;
  const flowsVisible = showExpense || showIncome;
  const hasLineChartEntries = visibleIncomeSeries.length > 0 || visibleExpenseSeries.length > 0;
  const hasVisibleTableRows = visibleEntriesForYear.length > 0;
  const flowToggleValue = useMemo(() => {
    const next: string[] = [];
    if (showExpense) {
      next.push('expense');
    }
    if (showIncome) {
      next.push('income');
    }
    return next;
  }, [showExpense, showIncome]);

  return (
    <Box sx={{ px: 0, pb: 3, pt: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton onClick={() => setYearDate(new Date(selectedYear - 1, 0, 1))} aria-label="Previous year">
            <ChevronLeftIcon />
          </IconButton>
          <Button variant="text" onClick={e => setPickerAnchor(e.currentTarget)} sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {selectedYear}
          </Button>
          <IconButton onClick={() => setYearDate(new Date(selectedYear + 1, 0, 1))} aria-label="Next year">
            <ChevronRightIcon />
          </IconButton>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" justifyContent="flex-end">
          {hasEntries && (
            <>
              <Typography variant="caption" color="text.secondary">{t('finance_chart_split_stack')}</Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={chartStacked ? 'stack' : 'split'}
                onChange={(_, v) => {
                  if (v) {
                    setChartStacked(v === 'stack');
                  }
                }}
              >
                <ToggleButton value="split">Split</ToggleButton>
                <ToggleButton value="stack">Stack</ToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup
                size="small"
                value={flowToggleValue}
                onChange={(_, values: string[]) => {
                  if (values.length === 0) {
                    return;
                  }
                  setShowExpense(values.includes('expense'));
                  setShowIncome(values.includes('income'));
                }}
              >
                <ToggleButton value="expense">{t('finance_line_show_expenses')}</ToggleButton>
                <ToggleButton value="income">{t('finance_line_show_income')}</ToggleButton>
              </ToggleButtonGroup>
            </>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddFromEvent}>
            Add entry
          </Button>
        </Stack>
      </Stack>

      {!hasEntries
        ? (
            <Paper sx={{ py: 8, px: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', backgroundColor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No finance data for
                {' '}
                {selectedYear}
              </Typography>
              <Typography color="text.secondary">
                Add your first entry to populate charts and yearly totals.
              </Typography>
            </Paper>
          )
        : (
            <Stack spacing={2.5}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('finance_line_over_time')}</Typography>
                {!hasLineChartEntries
                  ? (
                      <Typography color="text.secondary">{t('finance_line_empty')}</Typography>
                    )
                  : !flowsVisible
                      ? (
                          <Typography color="text.secondary">{t('finance_line_both_flows_hidden')}</Typography>
                        )
                      : (
                          <FinanceLineNetLabelsContext value={cumulativeNetCentsForChartMarks}>
                            <LineChart
                              height={300}
                              xAxis={[{ data: MONTH_LABELS, scaleType: 'band' }]}
                              series={combinedLineSeries}
                              grid={{ horizontal: true }}
                              margin={{ left: 52, right: 12, top: 32, bottom: 48 }}
                              slots={{ mark: FinanceLineMark }}
                              slotProps={{ legend: { direction: 'horizontal', position: { vertical: 'bottom', horizontal: 'center' } } }}
                              sx={th => ({
                                ...lineChartEntryAreaFillSx,
                                [`& path[data-series="${LINE_NET_TOTAL_ID}"][fill]:not([fill="none"])`]: {
                                  fill: `${alpha(th.palette.grey[600], 0.1)} !important`,
                                },
                              })}
                            />
                          </FinanceLineNetLabelsContext>
                        )}
              </Card>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
                <Card sx={{ p: 2, flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Monthly flow by entry</Typography>
                  {!hasAnyBarSeries
                    ? (
                        <Typography color="text.secondary">
                          {flowsVisible ? 'No income or expense entries for this year.' : t('finance_line_both_flows_hidden')}
                        </Typography>
                      )
                    : (
                        <BarChart
                          height={320}
                          xAxis={[{ data: MONTH_LABELS, scaleType: 'band' }]}
                          series={combinedBarSeries}
                          grid={{ horizontal: true }}
                          margin={{ left: 48, right: 8, top: 8, bottom: 40 }}
                          slotProps={{ legend: { direction: 'horizontal', position: { vertical: 'bottom', horizontal: 'center' } } }}
                        />
                      )}
                </Card>
                <Card
                  sx={{
                    p: 2,
                    flexShrink: 0,
                    width: { xs: '100%', md: 320 },
                    maxWidth: { xs: 360, md: 320 },
                    alignSelf: { xs: 'center', md: 'stretch' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, alignSelf: 'center' }}>
                    Year split
                  </Typography>
                  {!flowsVisible
                    ? (
                        <Typography color="text.secondary" variant="caption" sx={{ textAlign: 'center', px: 1 }}>
                          {t('finance_line_both_flows_hidden')}
                        </Typography>
                      )
                    : pieSeriesData.length === 0
                      ? (
                          <Typography color="text.secondary" variant="caption" sx={{ textAlign: 'center', px: 1 }}>
                            No entry totals for this year.
                          </Typography>
                        )
                      : (
                          <PieChart
                            width={280}
                            height={240}
                            margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                            series={[{ data: pieSeriesData }]}
                            slotProps={{
                              legend: {
                                direction: 'horizontal',
                                position: { vertical: 'bottom', horizontal: 'center' },
                              },
                            }}
                          />
                        )}
                </Card>
              </Stack>

              {!flowsVisible
                ? (
                    <Card sx={{ p: 2 }}>
                      <Typography color="text.secondary">{t('finance_line_both_flows_hidden')}</Typography>
                    </Card>
                  )
                : (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Card sx={{ p: 2, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{t('finance_card_totals')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('finance_metric_income')}</Typography>
                        <Typography variant="h6" sx={{ color: 'success.main' }}>{formatCurrency(yearlyIncomeYtd)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{t('finance_metric_expense')}</Typography>
                        <Typography variant="body2" sx={{ color: 'error.main' }}>{formatCurrency(yearlyExpenseYtd)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{t('finance_metric_net')}</Typography>
                        <Typography variant="body2" sx={{ color: netYtd >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(netYtd)}</Typography>
                      </Card>
                      <Card sx={{ p: 2, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{t('finance_card_average')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('finance_metric_income')}</Typography>
                        <Typography variant="h6" sx={{ color: 'success.main' }}>{formatCurrency(avgIncomeRealized)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{t('finance_metric_expense')}</Typography>
                        <Typography variant="body2" sx={{ color: 'error.main' }}>{formatCurrency(avgExpenseRealized)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{t('finance_metric_net')}</Typography>
                        <Typography variant="body2" sx={{ color: avgNetRealized >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(avgNetRealized)}</Typography>
                      </Card>
                      <Card sx={{ p: 2, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{t('finance_card_projections')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('finance_metric_income')}</Typography>
                        <Typography variant="h6" sx={{ color: 'success.main' }}>{formatCurrency(projectedIncome)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{t('finance_metric_expense')}</Typography>
                        <Typography variant="body2" sx={{ color: 'error.main' }}>{formatCurrency(projectedExpense)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{t('finance_metric_net')}</Typography>
                        <Typography variant="body2" sx={{ color: projectedNet >= 0 ? 'success.main' : 'error.main' }}>{formatCurrency(projectedNet)}</Typography>
                      </Card>
                    </Stack>
                  )}

              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Entries</Typography>
                {!flowsVisible
                  ? (
                      <Typography color="text.secondary">{t('finance_line_both_flows_hidden')}</Typography>
                    )
                  : !hasVisibleTableRows
                      ? (
                          <Typography color="text.secondary">{t('finance_line_empty')}</Typography>
                        )
                      : (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Color</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                {!assetId && <TableCell>Asset</TableCell>}
                                <TableCell>Type</TableCell>
                                <TableCell>Flow</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Date range</TableCell>
                                <TableCell>Attachments</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {visibleEntriesForYear.map(entry => (
                                <TableRow
                                  key={entry.id}
                                  hover
                                  onClick={e => openEntryDetails(entry, e.currentTarget, { top: e.clientY, left: e.clientX })}
                                  sx={{ cursor: 'pointer' }}
                                >
                                  <TableCell>
                                    <IconButton
                                      size="small"
                                      aria-label="Edit color"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRowColorEntry(entry);
                                        setRowColorAnchor(e.currentTarget);
                                      }}
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        bgcolor: entry.color ?? getDefaultFinanceColor(entry.flow, 0),
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>{entry.name}</TableCell>
                                  <TableCell>{categoryLabel(entry.category)}</TableCell>
                                  {!assetId && <TableCell>{assetLookup.get(entry.assetId) ?? `Asset ${entry.assetId}`}</TableCell>}
                                  <TableCell>{kindLabel(entry.kind)}</TableCell>
                                  <TableCell sx={{ color: entry.flow === 'income' ? 'success.main' : 'error.main' }}>{entry.flow}</TableCell>
                                  <TableCell>
                                    {entry.kind === 'manual_recurring'
                                      ? (sumManualForYear(entry, selectedYear) > 0 ? formatCurrency(sumManualForYear(entry, selectedYear)) : '—')
                                      : formatCurrency(entry.amountCents)}
                                  </TableCell>
                                  <TableCell>
                                    {entry.kind === 'one_time'
                                      ? formatDateString(entry.effectiveDate)
                                      : `${formatDateString(entry.recurringStart)} - ${formatDateString(entry.recurringEnd)}`}
                                  </TableCell>
                                  <TableCell>
                                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                      {(entry.attachments ?? []).map(att => (
                                        <Tooltip key={att.id} title={att.name}>
                                          <Chip
                                            component="button"
                                            label={truncateAttachmentName(att.name)}
                                            size="small"
                                            variant="outlined"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPreviewItem({ id: att.id, name: att.name, url: att.url });
                                            }}
                                            sx={{
                                              'maxWidth': 168,
                                              'height': 28,
                                              '& .MuiChip-label': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                display: 'block',
                                                px: 1,
                                              },
                                            }}
                                          />
                                        </Tooltip>
                                      ))}
                                      {(entry.attachments ?? []).length === 0 && '—'}
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right">
                                    {entry.kind === 'manual_recurring' && (
                                      <Button
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openMonthEditor(entry);
                                        }}
                                      >
                                        Edit months
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
              </Card>
            </Stack>
          )}

      <YearPickerPopover
        open={pickerAnchor != null}
        anchorEl={pickerAnchor}
        onClose={() => setPickerAnchor(null)}
        currentYear={selectedYear}
        onSelect={(year) => {
          setYearDate(new Date(year, 0, 1));
          setPickerAnchor(null);
        }}
        locale={locale}
      />

      <Popover
        open={addAnchor != null && addStep === 'category'}
        anchorEl={addAnchor}
        onClose={() => {
          setAddAnchor(null);
          setAddStep('category');
          setEditingEntry(null);
        }}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
        showArrow={false}
        minWidth={320}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Choose category</Typography>
          {!assetId && (
            <FormControl size="small" fullWidth>
              <InputLabel id="fin-global-asset">Asset</InputLabel>
              <Select
                labelId="fin-global-asset"
                label="Asset"
                value={globalPickedAssetId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  const s = String(v);
                  setGlobalPickedAssetId(s.length === 0 ? undefined : Number(s));
                }}
              >
                <MenuItem value="">Select asset</MenuItem>
                {assets.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.name || `Asset ${a.id}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Stack spacing={1}>
            {categoryOptions.map(opt => (
              <Button
                key={opt.key}
                variant="outlined"
                disabled={!assetId && !globalPickedAssetId}
                onClick={() => applyCategoryPreset(opt)}
              >
                {opt.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Popover>

      <Popover
        open={addAnchor != null && addStep === 'form'}
        anchorEl={addAnchor}
        onClose={() => {
          setAddAnchor(null);
          setAddStep('category');
          setEditingEntry(null);
        }}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
        showArrow={false}
        minWidth={400}
        maxWidth={480}
      >
        <Box component="form" onSubmit={onSubmit} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {editingEntry ? t('finance_edit_entry') : 'Add finance entry'}
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setAddStep('category');
                if (editingEntry) {
                  setEditingEntry(null);
                }
              }}
            >
              Back
            </Button>
          </Stack>

          {!assetId && (
            <FormControl size="small" error={Boolean(errors.assetId)}>
              <InputLabel id="finance-asset-label">Asset</InputLabel>
              <Controller
                name="assetId"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="finance-asset-label"
                    label="Asset"
                    value={field.value ?? globalPickedAssetId ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      const stringValue = String(value);
                      if (stringValue.length === 0) {
                        field.onChange(undefined);
                        setGlobalPickedAssetId(undefined);
                        return;
                      }
                      const n = Number(stringValue);
                      field.onChange(n);
                      setGlobalPickedAssetId(n);
                    }}
                  >
                    <MenuItem value="">Select asset</MenuItem>
                    {assets.map(item => (
                      <MenuItem key={item.id} value={item.id}>{item.name || `Asset ${item.id}`}</MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          )}

          <input type="hidden" {...register('category')} />

          <TextField
            label="Name"
            size="small"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name')}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Box
                      component="button"
                      type="button"
                      onClick={e => setColorPickerAnchor(e.currentTarget)}
                      aria-label="Color"
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: EVENT_COLORS.find(c => c.value === financeColor)?.hex ?? financeColor,
                        cursor: 'pointer',
                        p: 0,
                        border: 'none',
                        boxShadow: '0 0 2px',
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Popover
            open={Boolean(colorPickerAnchor)}
            anchorEl={colorPickerAnchor}
            onClose={() => setColorPickerAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            showArrow={false}
          >
            <Box sx={{ position: 'relative', p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 24px)', gap: 1 }}>
                {EVENT_COLORS.map(c => (
                  <Box
                    key={c.value}
                    component="button"
                    type="button"
                    onClick={() => {
                      setFinanceColor(c.hex);
                      setColorPickerAnchor(null);
                    }}
                    aria-label={c.label}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: c.hex,
                      border: financeColor === c.hex ? '2px solid' : '2px solid transparent',
                      borderColor: financeColor === c.hex ? 'primary.main' : 'transparent',
                      cursor: 'pointer',
                      p: 0,
                    }}
                  />
                ))}
                <Box
                  component="button"
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  aria-label="Custom color"
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: isCustomColor(financeColor) ? financeColor : 'grey.300',
                    border: isCustomColor(financeColor) ? '2px solid' : '2px solid transparent',
                    borderColor: isCustomColor(financeColor) ? 'primary.main' : 'transparent',
                    cursor: 'pointer',
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!isCustomColor(financeColor) && <PaletteIcon sx={{ fontSize: 14, color: 'grey.600' }} />}
                </Box>
              </Box>
              <input
                ref={colorInputRef}
                type="color"
                value={isCustomColor(financeColor) ? financeColor : '#3b82f6'}
                onChange={(e) => {
                  setFinanceColor(e.target.value);
                  setColorPickerAnchor(null);
                }}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                aria-hidden
              />
            </Box>
          </Popover>

          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel id="finance-kind-label">Type</InputLabel>
              <Controller
                name="kind"
                control={control}
                render={({ field }) => (
                  <Select {...field} labelId="finance-kind-label" label="Type">
                    <MenuItem value="one_time">One-time</MenuItem>
                    <MenuItem value="recurring">Recurring</MenuItem>
                    <MenuItem value="manual_recurring">Manual recurring</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel id="finance-flow-label">Flow</InputLabel>
              <Controller
                name="flow"
                control={control}
                render={({ field }) => (
                  <Select {...field} labelId="finance-flow-label" label="Flow">
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </Stack>

          <TextField
            label={kind === 'manual_recurring' ? 'Template amount (optional)' : 'Amount'}
            type="number"
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
            error={Boolean(errors.amount)}
            helperText={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          {kind === 'one_time'
            ? (
                <TextField
                  label="Date"
                  type="date"
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={Boolean(errors.effectiveDate)}
                  helperText={errors.effectiveDate?.message}
                  {...register('effectiveDate')}
                />
              )
            : (
                <>
                  <TextField
                    label="Recurring start"
                    type="date"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.recurringStart)}
                    helperText={errors.recurringStart?.message}
                    {...register('recurringStart')}
                  />
                  <TextField
                    label="Recurring end (optional)"
                    type="date"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.recurringEnd)}
                    helperText={errors.recurringEnd?.message}
                    {...register('recurringEnd')}
                  />
                </>
              )}

          {kind === 'manual_recurring' && (
            <>
              <Typography variant="caption" color="text.secondary">
                Amounts for
                {' '}
                {selectedYear}
                {' '}
                (GBP, optional per month)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {MONTH_LABELS.map((label, m) => (
                  <TextField
                    key={label}
                    label={label}
                    type="number"
                    size="small"
                    value={manualMonthsPounds[m] === 0 ? '' : manualMonthsPounds[m]}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const v = raw === '' ? 0 : Number.parseFloat(raw);
                      setManualMonthsPounds((prev) => {
                        const next = [...prev];
                        next[m] = Number.isFinite(v) ? v : 0;
                        return next;
                      });
                    }}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                ))}
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button size="small" variant={includeInitial ? 'contained' : 'outlined'} onClick={() => setIncludeInitial(!includeInitial)}>
                  Optional initial entry
                </Button>
              </Stack>
              {includeInitial && (
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Initial amount"
                    type="number"
                    size="small"
                    {...register('initialAmount', { valueAsNumber: true })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Initial date"
                    type="date"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('initialDate')}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              )}
            </>
          )}

          <Stack spacing={0.5}>
            <Button variant="outlined" component="label" size="small" disabled={!resolvedAssetIdForScope}>
              Attach PDF
              <input type="file" accept="application/pdf" hidden onChange={handleFilePick} />
            </Button>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {attachmentsDraft.map(att => (
                <Chip key={att.id} size="small" label={att.name} onDelete={() => setAttachmentsDraft(prev => prev.filter(a => a.id !== att.id))} />
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ pt: 1 }}>
            <Button
              onClick={() => {
                setAddAnchor(null);
                setAddStep('category');
                setEditingEntry(null);
              }}
              disabled={createFinanceEntry.isPending || updateFinanceEntry.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={createFinanceEntry.isPending || updateFinanceEntry.isPending}>
              {(createFinanceEntry.isPending || updateFinanceEntry.isPending) ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Box>
      </Popover>

      <EntryDetailsPopover
        open={entryDetailsEntry != null && (entryDetailsAnchor != null || entryDetailsAnchorPosition != null)}
        anchorEl={entryDetailsAnchor}
        anchorPosition={entryDetailsAnchorPosition}
        entry={entryDetailsEntry}
        onClose={closeEntryDetails}
        onEdit={openEditEntryForm}
        onDeleteClick={setDeleteConfirmAnchor}
      />

      <ConfirmPopover
        open={Boolean(entryDetailsEntry) && Boolean(deleteConfirmAnchor)}
        anchorEl={deleteConfirmAnchor}
        onClose={() => setDeleteConfirmAnchor(null)}
        onConfirm={() => void confirmDeleteEntry()}
        message={t('finance_delete_confirm_message')}
        confirmLabel={t('finance_delete_confirm_action')}
        cancelLabel={t('finance_delete_cancel_action')}
        confirmColor="error"
        loading={deleteFinanceEntry.isPending}
      />

      <DocsPreviewDialog open={previewItem != null} item={previewItem} onClose={() => setPreviewItem(null)} t={t} />

      <Dialog open={monthEditEntry != null} onClose={() => setMonthEditEntry(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Monthly amounts (
          {selectedYear}
          )
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, pt: 1 }}>
            {MONTH_LABELS.map((label, m) => (
              <TextField
                key={label}
                label={label}
                type="number"
                size="small"
                value={monthEditValues[m] === 0 ? '' : monthEditValues[m]}
                onChange={(e) => {
                  const raw = e.target.value;
                  const v = raw === '' ? 0 : Number.parseFloat(raw);
                  setMonthEditValues((prev) => {
                    const next = [...prev];
                    next[m] = Number.isFinite(v) ? v : 0;
                    return next;
                  });
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMonthEditEntry(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => void saveMonthEditor()}>Save</Button>
        </DialogActions>
      </Dialog>

      <Popover
        open={rowColorEntry != null && Boolean(rowColorAnchor)}
        anchorEl={rowColorAnchor}
        onClose={() => {
          setRowColorEntry(null);
          setRowColorAnchor(null);
        }}
        showArrow={false}
      >
        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(5, 24px)', gap: 1 }}>
          {EVENT_COLORS.map(c => (
            <Box
              key={c.value}
              component="button"
              type="button"
              onClick={() => rowColorEntry && void patchEntryColor(rowColorEntry, c.hex)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: c.hex,
                border: '2px solid transparent',
                cursor: 'pointer',
                p: 0,
              }}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
}
