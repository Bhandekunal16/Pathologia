import React from 'react';
import { PathologyTest, TEST_CATEGORY_LABELS } from '../../types/pathology-test.types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../lib/utils';

interface PathologyTestDetailModalProps {
  isOpen: boolean;
  test: PathologyTest | null;
  onClose: () => void;
}

const categoryStyles: Record<PathologyTest['category'], string> = {
  BLOOD: 'bg-rose-50 text-rose-700 border-rose-200',
  URINE: 'bg-amber-50 text-amber-700 border-amber-200',
  IMAGING: 'bg-sky-50 text-sky-700 border-sky-200',
  BODY_CHECKUP: 'bg-teal-50 text-teal-700 border-teal-200',
  OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
};

export const PathologyTestDetailModal: React.FC<PathologyTestDetailModalProps> = ({
  isOpen,
  test,
  onClose,
}) => {
  if (!test) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Test Manual & Details" maxWidth="2xl">
      <div className="px-6 py-4 space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{test.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{test.code}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border',
                  categoryStyles[test.category],
                )}
              >
                {TEST_CATEGORY_LABELS[test.category]}
              </span>
              <StatusBadge status={test.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-500">Specimen Type</span>
              <p className="text-slate-800 font-medium mt-0.5">{test.specimenType}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Test Rate</span>
              <p className="text-slate-800 font-medium mt-0.5">{formatCurrency(test.rate ?? 0)}</p>
            </div>
            {test.description && (
              <div className="sm:col-span-2">
                <span className="font-semibold text-slate-500">Description</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{test.description}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Collection & Preparation Manual
          </h5>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {test.manual}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
