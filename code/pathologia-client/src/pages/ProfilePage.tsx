import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User as UserIcon, KeyRound, ShieldCheck, Stethoscope, Palette } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ProfileForm } from '../features/profile/ProfileForm';
import { ChangePasswordForm } from '../features/profile/ChangePasswordForm';
import { ThemeSettings } from '../features/profile/ThemeSettings';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { UpdateProfilePayload, ChangePasswordPayload } from '../types/auth.types';

type ProfileTab = 'profile' | 'password';

function tabFromParam(param: string | null): ProfileTab {
  return param === 'security' || param === 'password' ? 'password' : 'profile';
}

export const ProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProfileTab>(() =>
    tabFromParam(searchParams.get('tab')),
  );

  const {
    profile,
    isLoadingProfile,
    updateProfile,
    isUpdatingProfile,
    changePassword,
    isChangingPassword,
  } = useAuth();

  useEffect(() => {
    setActiveTab(tabFromParam(searchParams.get('tab')));
  }, [searchParams]);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    if (tab === 'password') {
      setSearchParams({ tab: 'security' });
    } else {
      setSearchParams({});
    }
  };

  if (isLoadingProfile || !profile) {
    return <LoadingSpinner size="lg" label="Loading profile..." />;
  }

  const handleUpdateProfile = async (data: UpdateProfilePayload) => {
    await updateProfile(data);
  };

  const handleChangePassword = async (data: ChangePasswordPayload) => {
    await changePassword(data);
  };

  const isClinicalUser = profile.role === 'ADMIN' || profile.role === 'PATHOLOGIST';

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Account Settings & Profile"
        description={
          isClinicalUser
            ? 'Manage your personal profile, clinical details, and security credentials.'
            : 'Manage your personal profile and security credentials.'
        }
      />

      <div className="bg-surface rounded-xl border border-border p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl accent-glass font-bold text-lg text-accent-foreground">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{profile.fullName}</h2>
            <p className="text-xs text-foreground-muted">@{profile.username} &bull; {profile.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent border border-accent-muted">
            {profile.role === 'ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-admin" />
            ) : profile.role === 'PATHOLOGIST' ? (
              <Stethoscope className="w-3.5 h-3.5 text-accent" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-foreground-muted" />
            )}
            <span>
              {profile.role === 'ADMIN'
                ? 'Administrator'
                : profile.role === 'PATHOLOGIST'
                  ? 'Pathologist'
                  : 'User'}
            </span>
          </span>
        </div>
      </div>

      <div className="border-b border-border flex space-x-4">
        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors min-h-11 ${
            activeTab === 'profile'
              ? 'border-accent text-accent'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{isClinicalUser ? 'Personal & Clinical Info' : 'Personal Information'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('password')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors min-h-11 ${
            activeTab === 'password'
              ? 'border-accent text-accent'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {activeTab === 'profile' && (
        <ProfileForm
          user={profile}
          onSubmit={handleUpdateProfile}
          isLoading={isUpdatingProfile}
        />
      )}

      {activeTab === 'password' && (
        <ChangePasswordForm
          onSubmit={handleChangePassword}
          isLoading={isChangingPassword}
        />
      )}

      <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent-subtle border border-accent-muted text-accent">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Appearance</h3>
            <p className="text-xs text-foreground-muted mt-1">
              Pick a green palette and display mode for your workspace.
            </p>
          </div>
        </div>
        <ThemeSettings />
      </div>
    </div>
  );
};
