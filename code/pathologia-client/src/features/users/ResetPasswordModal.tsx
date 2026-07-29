import React, { useState } from 'react';
import { KeyRound, Mail, Sparkles, Copy, Check } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { User } from '../../types/auth.types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onReset: (sendTemporaryPassword: boolean) => Promise<{ temporaryPassword?: string } | void>;
  isLoading?: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  user,
  onClose,
  onReset,
  isLoading = false,
}) => {
  const [sendTemporaryPassword, setSendTemporaryPassword] = useState(true);
  const [result, setResult] = useState<{ temporaryPassword?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
    const res = await onReset(sendTemporaryPassword);
    if (res) {
      setResult(res);
    } else if (sendTemporaryPassword) {
      setResult({ temporaryPassword: undefined });
    } else {
      setResult({});
    }
  };

  const handleClose = () => {
    setResult(null);
    setCopied(false);
    setSendTemporaryPassword(true);
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset User Password" maxWidth="md">
      <div className="p-6">
        {!result ? (
          <>
            <p className="text-xs text-slate-600 mb-4">
              Select password recovery method for <span className="font-bold text-slate-900">{user.fullName}</span> (@{user.username}):
            </p>

            <div className="space-y-3 mb-6">
              <label
                className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  sendTemporaryPassword
                    ? 'bg-teal-50/80 border-teal-300 ring-1 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="resetMethod"
                  value="temp_password"
                  checked={sendTemporaryPassword}
                  onChange={() => setSendTemporaryPassword(true)}
                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Send Temporary Password via Email</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Generates a temporary password and sends it to the user&apos;s email.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  !sendTemporaryPassword
                    ? 'bg-teal-50/80 border-teal-300 ring-1 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="resetMethod"
                  value="reset_link"
                  checked={!sendTemporaryPassword}
                  onChange={() => setSendTemporaryPassword(false)}
                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>Send Password Reset Link</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sends a secure reset link to the user email ({user.email}).
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Confirm Reset</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-900 mb-1">Password Reset Successful</h4>
              {result.temporaryPassword && (
                <div className="mt-3">
                  <p className="text-[11px] text-emerald-700 mb-1">Temporary Password:</p>
                  <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-lg">
                    <code className="text-sm font-bold text-slate-900 font-mono">
                      {result.temporaryPassword}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.temporaryPassword!)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
                      title="Copy temporary password"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!result.temporaryPassword && (
                <p className="text-xs text-emerald-800 mt-2">
                  {sendTemporaryPassword
                    ? `A temporary password has been sent to ${user.email}.`
                    : `A reset link has been dispatched to ${user.email}.`}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
