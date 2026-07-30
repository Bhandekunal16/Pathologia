import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send, UserPlus } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Input } from '../components/forms/Input';
import { useInvites } from '../hooks/useInvites';
import { inviteUserSchema } from '../utils/validators';

interface InviteUserFormData {
  email: string;
}

export const InviteUserPage: React.FC = () => {
  const { sendInvite, isSendingInvite } = useInvites();
  const [lastInvitedEmail, setLastInvitedEmail] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: InviteUserFormData) => {
    await sendInvite({ email: data.email });
    setLastInvitedEmail(data.email);
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invite User"
        description="Send an email invitation so the recipient can register as a standard user on Pathologia."
      />

      <div className="max-w-xl bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/60 p-4">
          <UserPlus className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            Invited users can only register with the <strong>User</strong> role. They will receive
            an email with a secure link valid for 7 days to set up their own account.
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="User Email Address"
            type="email"
            placeholder="e.g. user@example.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <button
            type="submit"
            disabled={isSendingInvite}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSendingInvite ? 'Sending Invite...' : 'Send Invitation'}</span>
          </button>
        </form>

        {lastInvitedEmail && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            Invitation email sent to <strong>{lastInvitedEmail}</strong>.
          </p>
        )}
      </div>
    </div>
  );
};
