import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  UserPlus,
  Eye,
  Edit,
  Trash2,
  KeyRound,
  UserCheck,
  UserX,
  MoreVertical,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { RoleBadge } from '../components/common/RoleBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { DataTable } from '../components/table/DataTable';
import { DeleteUserModal } from '../features/users/DeleteUserModal';
import { ResetPasswordModal } from '../features/users/ResetPasswordModal';
import { ActivateUserModal } from '../features/users/ActivateUserModal';
import { useUsers } from '../hooks/useUsers';
import { formatDate } from '../utils/formatters';
import { User } from '../types/auth.types';
import { UserRole, UserStatus } from '../types/common.types';

export const UserListPage: React.FC = () => {
  const navigate = useNavigate();

  // Filters state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);

  const {
    usersData,
    isLoadingUsers,
    deleteUser,
    isDeletingUser,
    updateStatus,
    isUpdatingStatus,
    resetPassword,
    isResettingPassword,
  } = useUsers({
    page,
    limit,
    search,
    role: roleFilter,
    status: statusFilter,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // Action handlers
  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setIsDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  const handleStatusConfirm = async () => {
    if (selectedUser) {
      const nextStatus: UserStatus = selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateStatus({ id: selectedUser.id, status: nextStatus });
      setIsActivateOpen(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async (sendTemporaryPassword: boolean) => {
    if (selectedUser) {
      const res = await resetPassword({
        id: selectedUser.id,
        payload: { sendTemporaryPassword },
      });
      return res?.data;
    }
  };

  // Table Columns definition
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center space-x-3 py-0.5">
            <Avatar name={u.fullName} src={u.avatarUrl} size="md" />
            <div>
              <Link
                to={`/users/${u.id}`}
                className="font-bold text-slate-900 hover:text-teal-700 transition-colors"
              >
                {u.fullName}
              </Link>
              <div className="text-[11px] text-slate-500 font-normal">
                {u.department || 'General Pathology'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="font-medium text-slate-700">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => (
        <code className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
          @{row.original.username}
        </code>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <RoleBadge role={row.original.role as UserRole} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status as UserStatus} />,
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <span className="text-slate-500 text-[11px]">
          {formatDate(row.original.lastLogin)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <span className="text-slate-500 text-[11px]">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center space-x-1 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/users/${u.id}`)}
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate(`/users/${u.id}/edit`)}
              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit User"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedUser(u);
                setIsActivateOpen(true);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                u.status === 'ACTIVE'
                  ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
              title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
            >
              {u.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedUser(u);
                setIsResetOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="Reset Password"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedUser(u);
                setIsDeleteOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Search, filter, and manage pathologist & administrator credentials."
        action={
          <button
            type="button"
            onClick={() => navigate('/users/new')}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <SearchInput value={search} onChange={handleSearchChange} />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PATHOLOGIST">Pathologist</option>
            <option value="USER">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <DataTable
        columns={columns}
        data={usersData?.items || []}
        isLoading={isLoadingUsers}
        totalRecords={usersData?.total || 0}
        currentPage={page}
        totalPages={usersData?.totalPages || 1}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        emptyTitle="No pathologists or users found"
        emptyDescription="Try adjusting your search criteria or role filters."
      />

      {/* Action Modals */}
      <DeleteUserModal
        isOpen={isDeleteOpen}
        user={selectedUser}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletingUser}
      />

      <ActivateUserModal
        isOpen={isActivateOpen}
        user={selectedUser}
        onClose={() => {
          setIsActivateOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleStatusConfirm}
        isLoading={isUpdatingStatus}
      />

      <ResetPasswordModal
        isOpen={isResetOpen}
        user={selectedUser}
        onClose={() => {
          setIsResetOpen(false);
          setSelectedUser(null);
        }}
        onReset={handleResetPassword}
        isLoading={isResettingPassword}
      />
    </div>
  );
};
