import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { UserForm, UserFormData } from '../features/users/UserForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { useUser, useUsers } from '../hooks/useUsers';
import { toUpdateUserPayload } from '../utils/apiPayloads';

export const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, refetch } = useUser(id);
  const { updateUser, isUpdatingUser } = useUsers();

  const handleSubmit = async (data: UserFormData) => {
    if (id) {
      await updateUser({ id, payload: toUpdateUserPayload(data) });
      navigate('/users');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading user details..." />;
  }

  if (isError || !user) {
    return (
      <ErrorState
        title="User Not Found"
        message="The requested user account could not be retrieved."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Edit User: ${user.fullName}`}
        description="Update role assignment, status, and clinical details."
      />

      <UserForm
        initialData={user}
        isEdit
        onSubmit={handleSubmit}
        isLoading={isUpdatingUser}
        onCancel={() => navigate('/users')}
      />
    </div>
  );
};
