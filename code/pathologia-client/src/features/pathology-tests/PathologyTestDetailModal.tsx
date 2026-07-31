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
  BLOOD: 'bg-danger-muted text-danger border-danger-border',
  URINE: 'bg-warning-muted text-warning border-warning-border',
  IMAGING: 'bg-info-muted text-info border-info-border',
  BODY_CHECKUP: 'bg-accent-subtle text-accent border-accent-muted',
  OTHER: 'bg-surface-sunken text-foreground-secondary border-border',
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
        <div className="rounded-xl border border-border bg-surface-sunken/70 p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-foreground">{test.name}</h4>
              <p className="text-xs text-foreground-muted mt-0.5 font-mono">{test.code}</p>
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
              <span className="font-semibold text-foreground-muted">Specimen Type</span>
              <p className="text-foreground font-medium mt-0.5">{test.specimenType}</p>
            </div>
            <div>
              <span className="font-semibold text-foreground-muted">Test Rate</span>
              <p className="text-foreground font-medium mt-0.5">{formatCurrency(test.rate ?? 0)}</p>
            </div>
            {test.description && (
              <div className="sm:col-span-2">
                <span className="font-semibold text-foreground-muted">Description</span>
                <p className="text-foreground-secondary mt-0.5 leading-relaxed">{test.description}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h5 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
            Collection & Preparation Manual
          </h5>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap">
              {test.manual}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
