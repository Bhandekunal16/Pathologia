import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Filter, ArrowLeftRight } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { DataTable } from '../components/table/DataTable';
import { AuditLogDetailModal } from '../features/audit/AuditLogDetailModal';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditLog } from '../types/audit.types';
import {
  formatAuditAction,
  getAuditRequestSummary,
} from '../utils/auditMapper';
import { formatDate } from '../utils/formatters';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'USER_CREATE', label: 'User Create' },
  { value: 'USER_UPDATE', label: 'User Update' },
  { value: 'USER_DELETE', label: 'User Delete' },
  { value: 'PASSWORD_RESET', label: 'Password Reset' },
  { value: 'PASSWORD_CHANGE', label: 'Password Change' },
  { value: 'USER_ACTIVATE', label: 'User Activate' },
  { value: 'USER_DEACTIVATE', label: 'User Deactivate' },
];

export const RequestResponsePage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { auditLogsData, isLoadingAuditLogs } = useAuditLogs({
    page,
    limit,
    search,
    action: actionFilter,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActionFilter(e.target.value);
    setPage(1);
  };

  const openDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div>
            <div className="text-xs font-semibold text-slate-800">
              {log.userName || 'System'}
            </div>
            {log.userEmail && (
              <div className="text-[11px] text-slate-500">{log.userEmail}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          {formatAuditAction(row.original.action)}
        </span>
      ),
    },
    {
      id: 'request',
      header: 'Request',
      cell: ({ row }) => (
        <code className="text-[11px] text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
          {getAuditRequestSummary(row.original)}
        </code>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">{row.original.ipAddress || 'N/A'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Details',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openDetail(row.original)}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Request & Response Logs"
        description="Review API request and response activity across the admin platform."
        action={
          <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
            <ArrowLeftRight className="w-4 h-4 text-teal-600" />
            <span>Audit Trail</span>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by user, action, entity..."
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={actionFilter}
            onChange={handleActionChange}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={auditLogsData?.items || []}
        isLoading={isLoadingAuditLogs}
        totalRecords={auditLogsData?.total || 0}
        currentPage={page}
        totalPages={auditLogsData?.totalPages || 1}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        emptyTitle="No request/response logs found"
        emptyDescription="System activity will appear here as users interact with the platform."
      />

      <AuditLogDetailModal
        isOpen={isDetailOpen}
        log={selectedLog}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
};
