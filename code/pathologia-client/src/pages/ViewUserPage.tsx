import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { UserView } from '../features/users/UserView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { useUser } from '../hooks/useUsers';

export const ViewUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, refetch } = useUser(id);

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Fetching user profile..." />;
  }

  if (isError || !user) {
    return (
      <ErrorState
        title="User Not Found"
        message="Unable to locate the specified user account."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="User Profile Details"
        description="Read-only view of user credentials and medical department information."
      />

      <UserView
        user={user}
        onEdit={() => navigate(`/users/${user.id}/edit`)}
        onBack={() => navigate('/users')}
      />
    </div>
  );
};
