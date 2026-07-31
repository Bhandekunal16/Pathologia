import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, ScrollText } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/table/DataTable';
import { IconButton } from '../components/ui/IconButton';
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
  { value: 'USER_INVITE', label: 'User Invite' },
  { value: 'USER_REGISTER', label: 'User Register' },
  { value: 'TEST_BOOKING_CREATE', label: 'Test Booking Create' },
  { value: 'TEST_BOOKING_UPDATE', label: 'Test Booking Update' },
  { value: 'TEST_BOOKING_CANCEL', label: 'Test Booking Cancel' },
  { value: 'TEST_BOOKING_OTP_SEND', label: 'Test Booking OTP Send' },
  { value: 'BLOOD_TEST_STATUS_UPDATE', label: 'Blood Test Status Update' },
  { value: 'BLOOD_TEST_REPORT_UPLOAD', label: 'Blood Test Report Upload' },
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
        <span className="table-meta">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div>
            <div className="table-cell-text">
              {log.userName || 'System'}
            </div>
            {log.userEmail && (
              <div className="table-meta">{log.userEmail}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <span className="badge-accent">
          {formatAuditAction(row.original.action)}
        </span>
      ),
    },
    {
      id: 'request',
      header: 'Request',
      cell: ({ row }) => (
        <code className="table-code">
          {getAuditRequestSummary(row.original)}
        </code>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <IconButton
          variant="teal"
          title="View details"
          aria-label="View audit log details"
          onClick={() => openDetail(row.original)}
        >
          <Eye className="w-4 h-4" />
        </IconButton>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Review system activity and API request history across the admin platform."
        action={
          <div className="header-chip">
            <ScrollText className="w-4 h-4 header-chip-icon" />
            <span>Activity Trail</span>
          </div>
        }
      />

      <div className="data-panel">
        <FilterBar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by user, action, entity..."
          variant="embedded"
        >
          <select
            value={actionFilter}
            onChange={handleActionChange}
            className="form-select"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterBar>

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
          emptyTitle="No audit logs found"
          emptyDescription="System activity will appear here as users interact with the platform."
          className="data-panel-table"
        />
      </div>

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
