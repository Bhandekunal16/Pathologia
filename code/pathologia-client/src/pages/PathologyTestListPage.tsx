import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen, Edit, Filter, IndianRupee, List, Plus } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
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
import { cn } from '../lib/utils';

type CatalogTab = 'tests' | 'rates';

const categoryBadgeStyles: Record<PathologyTest['category'], string> = {
  BLOOD: 'bg-rose-50 text-rose-700',
  URINE: 'bg-amber-50 text-amber-700',
  IMAGING: 'bg-sky-50 text-sky-700',
  BODY_CHECKUP: 'bg-teal-50 text-teal-700',
  OTHER: 'bg-slate-100 text-slate-700',
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
              className="font-bold text-slate-900 hover:text-teal-700 transition-colors text-left"
            >
              {test.name}
            </button>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{test.code}</p>
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
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide',
              categoryBadgeStyles[category],
            )}
          >
            {TEST_CATEGORY_LABELS[category]}
          </span>
        );
      },
    },
    {
      accessorKey: 'specimenType',
      header: 'Specimen',
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium">{row.original.specimenType}</span>
      ),
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }) => (
        <span className="text-xs font-bold text-slate-800">
          {formatCurrency(row.original.rate ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 line-clamp-2 max-w-xs">
          {row.original.description || '—'}
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
      header: 'Actions',
      cell: ({ row }) => {
        const test = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openDetail(test)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
            {canManageTests && (
              <button
                type="button"
                onClick={() => openEditForm(test)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
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
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Test</span>
            </button>
          ) : undefined
        }
      />

      <div className="flex border-b border-slate-200">
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
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by test name, code, or specimen..."
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
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
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          )}
        </div>
      </div>

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
        />
      )}

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
