import React, { useState } from 'react';
import { AuditLog } from '../../types/audit.types';
import { Modal } from '../../components/common/Modal';
import {
  formatAuditAction,
  getAuditRequestPayload,
  getAuditResponsePayload,
} from '../../utils/auditMapper';
import { formatDate } from '../../utils/formatters';
import { cn } from '../../lib/utils';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  log: AuditLog | null;
  onClose: () => void;
}

type DetailTab = 'request' | 'response';

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isOpen,
  log,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('request');

  if (!log) return null;

  const requestPayload = getAuditRequestPayload(log);
  const responsePayload = getAuditResponsePayload(log);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request & Response Details"
      maxWidth="2xl"
    >
      <div className="px-6 py-4 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-slate-900">{formatAuditAction(log.action)}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {log.userName || 'System'}
                {log.userEmail ? ` • ${log.userEmail}` : ''}
              </p>
            </div>
            <span className="text-[11px] text-slate-500">{formatDate(log.createdAt)}</span>
          </div>
        </div>

        <div className="flex border-b border-slate-200">
          {(['request', 'response'] as DetailTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-xs font-bold border-b-2 transition-colors capitalize',
                activeTab === tab
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-950 overflow-hidden">
          <pre className="p-4 text-[11px] leading-relaxed text-emerald-300 overflow-x-auto max-h-[420px]">
            {JSON.stringify(
              activeTab === 'request' ? requestPayload : responsePayload,
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
