import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen, Edit, List, Plus, IndianRupee } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable } from '../components/table/DataTable';
import { PathologyTestDetailModal } from '../features/pathology-tests/PathologyTestDetailModal';
import {
  PathologyTestFormData,
  PathologyTestFormModal,
} from '../features/pathology-tests/PathologyTestFormModal';
import { PathologyTestRatesTab } from '../features/pathology-tests/PathologyTestRatesTab';
import { usePathologyTests } from '../hooks/usePathologyTests';
import {
  PathologyTest,
  TEST_CATEGORY_LABELS,
  TEST_CATEGORY_OPTIONS,
} from '../types/pathology-test.types';
import { formatCurrency } from '../utils/formatters';
import { IconButton } from '../components/ui/IconButton';
import { cn } from '../lib/utils';

type CatalogTab = 'tests' | 'rates';

const categoryBadgeStyles: Record<PathologyTest['category'], string> = {
  BLOOD: 'badge-category-blood',
  URINE: 'badge-category-urine',
  IMAGING: 'badge-category-imaging',
  BODY_CHECKUP: 'badge-category-body',
  OTHER: 'badge-category-other',
};

export const PathologyTestListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CatalogTab>('tests');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTest, setSelectedTest] = useState<PathologyTest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<PathologyTest | null>(null);

  const {
    testsData,
    isLoadingTests,
    canManageTests,
    canViewInactiveTests,
    createTest,
    isCreatingTest,
    updateTest,
    isUpdatingTest,
  } = usePathologyTests({
    page,
    limit,
    search,
    category: categoryFilter,
    status: statusFilter,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const openDetail = (test: PathologyTest) => {
    setSelectedTest(test);
    setIsDetailOpen(true);
  };

  const openCreateForm = () => {
    setEditingTest(null);
    setIsFormOpen(true);
  };

  const openEditForm = (test: PathologyTest) => {
    setEditingTest(test);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: PathologyTestFormData) => {
    if (editingTest) {
      await updateTest({ id: editingTest.id, payload: data });
    } else {
      await createTest(data);
    }
    setIsFormOpen(false);
    setEditingTest(null);
  };

  const handleSaveRate = async (id: string, rate: number) => {
    await updateTest({ id, payload: { rate } });
  };

  const columns: ColumnDef<PathologyTest>[] = [
    {
      accessorKey: 'name',
      header: 'Test Name',
      cell: ({ row }) => {
        const test = row.original;
        return (
          <div className="py-0.5">
            <button
              type="button"
              onClick={() => openDetail(test)}
              className="table-link text-left"
            >
              {test.name}
            </button>
            <p className="table-meta font-mono mt-0.5">{test.code}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <span
            className={cn(categoryBadgeStyles[category])}
          >
            {TEST_CATEGORY_LABELS[category]}
          </span>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }) => (
        <span className="table-cell-text">
          {formatCurrency(row.original.rate ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const test = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            <IconButton
              variant="teal"
              title="View details"
              aria-label="View test details"
              onClick={() => openDetail(test)}
            >
              <BookOpen className="w-4 h-4" />
            </IconButton>
            {canManageTests && (
              <IconButton
                variant="blue"
                title="Edit test"
                aria-label="Edit test"
                onClick={() => openEditForm(test)}
              >
                <Edit className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pathology Test Catalog"
        description={
          canManageTests
            ? 'Browse, add, and edit pathology tests with rates, collection manuals, and preparation guides.'
            : 'Browse blood tests, urine tests, imaging, and body checkup panels with rates and collection manuals.'
        }
        action={
          canManageTests && activeTab === 'tests' ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Test</span>
            </button>
          ) : undefined
        }
      />

      <div className="tab-bar">
        {[
          { id: 'tests' as const, label: 'Tests', icon: List },
          { id: 'rates' as const, label: 'Test Rates', icon: IndianRupee },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn('tab-item', activeTab === tab.id && 'tab-item--active')}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="data-panel">
        <FilterBar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by test name, code, or specimen..."
          variant="embedded"
        >
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="form-select"
          >
            <option value="">All Categories</option>
            {TEST_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {canViewInactiveTests && (
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="form-select"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          )}
        </FilterBar>

        {activeTab === 'tests' ? (
          <DataTable
            columns={columns}
            data={testsData?.items || []}
            isLoading={isLoadingTests}
            totalRecords={testsData?.total || 0}
            currentPage={page}
            totalPages={testsData?.totalPages || 1}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            emptyTitle="No pathology tests found"
            emptyDescription="Try adjusting your search or category filters."
            className="data-panel-table"
          />
        ) : (
          <PathologyTestRatesTab
            tests={testsData?.items || []}
            isLoading={isLoadingTests}
            totalRecords={testsData?.total || 0}
            currentPage={page}
            totalPages={testsData?.totalPages || 1}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            canManageTests={canManageTests}
            onSaveRate={handleSaveRate}
            isSavingRate={isUpdatingTest}
            embedded
          />
        )}
      </div>

      <PathologyTestDetailModal
        isOpen={isDetailOpen}
        test={selectedTest}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTest(null);
        }}
      />

      <PathologyTestFormModal
        isOpen={isFormOpen}
        test={editingTest}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTest(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={isCreatingTest || isUpdatingTest}
      />
    </div>
  );
};
