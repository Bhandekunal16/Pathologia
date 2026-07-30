import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { DataTable } from '../../components/table/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  PathologyTest,
  TEST_CATEGORY_LABELS,
} from '../../types/pathology-test.types';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../lib/utils';

interface PathologyTestRatesTabProps {
  tests: PathologyTest[];
  isLoading: boolean;
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  canManageTests: boolean;
  onSaveRate: (id: string, rate: number) => Promise<void>;
  isSavingRate: boolean;
}

const categoryBadgeStyles: Record<PathologyTest['category'], string> = {
  BLOOD: 'bg-rose-50 text-rose-700',
  URINE: 'bg-amber-50 text-amber-700',
  IMAGING: 'bg-sky-50 text-sky-700',
  BODY_CHECKUP: 'bg-teal-50 text-teal-700',
  OTHER: 'bg-slate-100 text-slate-700',
};

export const PathologyTestRatesTab: React.FC<PathologyTestRatesTabProps> = ({
  tests,
  isLoading,
  totalRecords,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  canManageTests,
  onSaveRate,
  isSavingRate,
}) => {
  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({});
  const [savingTestId, setSavingTestId] = useState<string | null>(null);

  useEffect(() => {
    const nextDrafts: Record<string, string> = {};
    tests.forEach((test) => {
      nextDrafts[test.id] = String(test.rate ?? 0);
    });
    setRateDrafts(nextDrafts);
  }, [tests]);

  const handleRateChange = (testId: string, value: string) => {
    setRateDrafts((prev) => ({ ...prev, [testId]: value }));
  };

  const handleSaveRate = async (test: PathologyTest) => {
    const parsedRate = Number(rateDrafts[test.id]);
    if (Number.isNaN(parsedRate) || parsedRate < 0) {
      return;
    }

    setSavingTestId(test.id);
    try {
      await onSaveRate(test.id, parsedRate);
    } finally {
      setSavingTestId(null);
    }
  };

  const columns: ColumnDef<PathologyTest>[] = [
    {
      accessorKey: 'name',
      header: 'Test Name',
      cell: ({ row }) => (
        <div className="py-0.5">
          <p className="font-bold text-slate-900">{row.original.name}</p>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{row.original.code}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span
          className={cn(
            'inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide',
            categoryBadgeStyles[row.original.category],
          )}
        >
          {TEST_CATEGORY_LABELS[row.original.category]}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }) => {
        const test = row.original;
        if (!canManageTests) {
          return (
            <span className="text-xs font-bold text-slate-800">
              {formatCurrency(test.rate ?? 0)}
            </span>
          );
        }

        const isDirty = Number(rateDrafts[test.id]) !== (test.rate ?? 0);
        const isSaving = isSavingRate && savingTestId === test.id;

        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rateDrafts[test.id] ?? '0'}
                onChange={(e) => handleRateChange(test.id, e.target.value)}
                className="w-28 pl-7 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSaveRate(test)}
              disabled={!isDirty || isSaving}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving' : 'Save'}</span>
            </button>
          </div>
        );
      },
    },
    {
      id: 'currentRate',
      header: 'Saved Rate',
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-teal-700">
          {formatCurrency(row.original.rate ?? 0)}
        </span>
      ),
    },
  ].filter((column) => canManageTests || column.id !== 'currentRate');

  return (
    <DataTable
      columns={columns}
      data={tests}
      isLoading={isLoading}
      totalRecords={totalRecords}
      currentPage={currentPage}
      totalPages={totalPages}
      limit={limit}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      emptyTitle="No test rates found"
      emptyDescription="Add pathology tests to manage their rates."
    />
  );
};
