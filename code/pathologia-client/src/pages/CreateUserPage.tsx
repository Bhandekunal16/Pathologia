import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { UserForm, UserFormData } from '../features/users/UserForm';
import { useUsers } from '../hooks/useUsers';
import { toCreateUserPayload } from '../utils/apiPayloads';

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { createUser, isCreatingUser } = useUsers();

  const handleSubmit = async (data: UserFormData) => {
    await createUser(toCreateUserPayload(data));
    navigate('/users');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Create New User"
        description="Provision a new pathologist or admin account with role-based access."
      />

      <UserForm
        onSubmit={handleSubmit}
        isLoading={isCreatingUser}
        onCancel={() => navigate('/users')}
      />
    </div>
  );
};
