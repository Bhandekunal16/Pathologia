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
  embedded?: boolean;
}

const categoryBadgeStyles: Record<PathologyTest['category'], string> = {
  BLOOD: 'badge-category-blood',
  URINE: 'badge-category-urine',
  IMAGING: 'badge-category-imaging',
  BODY_CHECKUP: 'badge-category-body',
  OTHER: 'badge-category-other',
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
  embedded = false,
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
          <p className="table-link">{row.original.name}</p>
          <p className="table-meta font-mono mt-0.5">{row.original.code}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className={categoryBadgeStyles[row.original.category]}>
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
            <span className="table-cell-text">
              {formatCurrency(test.rate ?? 0)}
            </span>
          );
        }

        const isDirty = Number(rateDrafts[test.id]) !== (test.rate ?? 0);
        const isSaving = isSavingRate && savingTestId === test.id;

        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rateDrafts[test.id] ?? '0'}
                onChange={(e) => handleRateChange(test.id, e.target.value)}
                className="input-inline"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSaveRate(test)}
              disabled={!isDirty || isSaving}
              className="btn-sm-primary"
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
        <span className="text-accent-emphasis">
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
      className={embedded ? 'data-panel-table' : undefined}
    />
  );
};
