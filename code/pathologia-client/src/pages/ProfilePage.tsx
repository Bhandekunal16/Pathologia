import React, { useState } from 'react';
import { User as UserIcon, KeyRound, ShieldCheck, Stethoscope } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ProfileForm } from '../features/profile/ProfileForm';
import { ChangePasswordForm } from '../features/profile/ChangePasswordForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { UpdateProfilePayload, ChangePasswordPayload } from '../types/auth.types';

export const ProfilePage: React.FC = () => {
  const {
    profile,
    isLoadingProfile,
    updateProfile,
    isUpdatingProfile,
    changePassword,
    isChangingPassword,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

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

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-lg shadow-xs">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile.fullName}</h2>
            <p className="text-xs text-slate-500">@{profile.username} &bull; {profile.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            {profile.role === 'ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            ) : profile.role === 'PATHOLOGIST' ? (
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-slate-600" />
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

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{isClinicalUser ? 'Personal & Clinical Info' : 'Personal Information'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* Tab Panels */}
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
    </div>
  );
};
