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
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DropdownMenu } from '../components/common/DropdownMenu';
import { RoleBadge } from '../components/common/RoleBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { DataTable } from '../components/table/DataTable';
import { IconButton } from '../components/ui/IconButton';
import { DeleteUserModal } from '../features/users/DeleteUserModal';
import { ResetPasswordModal } from '../features/users/ResetPasswordModal';
import { ActivateUserModal } from '../features/users/ActivateUserModal';
import { useUsers } from '../hooks/useUsers';
import { User } from '../types/auth.types';
import { UserRole, UserStatus } from '../types/common.types';

export const UserListPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
                className="table-link"
              >
                {u.fullName}
              </Link>
              <div className="table-meta">
                {u.department ? u.department : `@${u.username}`}
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
        <span className="table-cell-text">{row.original.email}</span>
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
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <IconButton
              variant="teal"
              title="View Details"
              aria-label="View user details"
              onClick={() => navigate(`/users/${u.id}`)}
            >
              <Eye className="w-4 h-4" />
            </IconButton>

            <IconButton
              variant="blue"
              title="Edit User"
              aria-label="Edit user"
              onClick={() => navigate(`/users/${u.id}/edit`)}
            >
              <Edit className="w-4 h-4" />
            </IconButton>

            <DropdownMenu
              triggerLabel="User actions"
              items={[
                {
                  id: 'status',
                  label: u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User',
                  icon:
                    u.status === 'ACTIVE' ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    ),
                  onClick: () => {
                    setSelectedUser(u);
                    setIsActivateOpen(true);
                  },
                },
                {
                  id: 'reset',
                  label: 'Reset Password',
                  icon: <KeyRound className="w-4 h-4" />,
                  onClick: () => {
                    setSelectedUser(u);
                    setIsResetOpen(true);
                  },
                },
                {
                  id: 'delete',
                  label: 'Delete User',
                  icon: <Trash2 className="w-4 h-4" />,
                  variant: 'danger',
                  onClick: () => {
                    setSelectedUser(u);
                    setIsDeleteOpen(true);
                  },
                },
              ]}
            />
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
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        }
      />

      <div className="data-panel">
        <FilterBar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search users by name, email, or username..."
          variant="embedded"
        >
          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="form-select"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PATHOLOGIST">Pathologist</option>
            <option value="USER">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="form-select"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </FilterBar>

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
          className="data-panel-table"
        />
      </div>

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
