import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, FlaskConical, Loader2, Save } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/forms/Input';
import { PathologyTest, TEST_CATEGORY_LABELS, TestCategory } from '../../types/pathology-test.types';
import { TestBooking, UpdateTestBookingPayload } from '../../types/test-booking.types';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../lib/utils';

interface BookingEditModalProps {
  isOpen: boolean;
  booking: TestBooking | null;
  availableTests: PathologyTest[];
  isLoadingTests?: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (id: string, payload: UpdateTestBookingPayload) => Promise<void>;
}

const CATEGORY_ORDER: TestCategory[] = [
  'BLOOD',
  'URINE',
  'IMAGING',
  'BODY_CHECKUP',
  'OTHER',
];

function toLocalDateTimeInput(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function getMinDateTime(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 30);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export const BookingEditModal: React.FC<BookingEditModalProps> = ({
  isOpen,
  booking,
  availableTests,
  isLoadingTests = false,
  isSaving = false,
  onClose,
  onSave,
}) => {
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!booking || !isOpen) return;
    setScheduledAt(toLocalDateTimeInput(booking.scheduledAt));
    setSelectedTestIds(booking.tests.map((test) => test.testId));
    setNotes(booking.notes ?? '');
  }, [booking, isOpen]);

  const testsByCategory = useMemo(() => {
    const grouped = new Map<TestCategory, PathologyTest[]>();
    for (const category of CATEGORY_ORDER) {
      grouped.set(category, []);
    }
    for (const test of availableTests) {
      const list = grouped.get(test.category) ?? [];
      list.push(test);
      grouped.set(test.category, list);
    }
    return CATEGORY_ORDER.map((category) => ({
      category,
      label: TEST_CATEGORY_LABELS[category],
      tests: grouped.get(category) ?? [],
    })).filter((group) => group.tests.length > 0);
  }, [availableTests]);

  const selectedTotal = useMemo(() => {
    return availableTests
      .filter((test) => selectedTestIds.includes(test.id))
      .reduce((sum, test) => sum + (test.rate ?? 0), 0);
  }, [availableTests, selectedTestIds]);

  if (!booking) return null;

  const toggleTest = (testId: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId],
    );
  };

  const handleSave = async () => {
    if (!scheduledAt || selectedTestIds.length === 0) return;
    await onSave(booking.id, {
      testIds: selectedTestIds,
      scheduledAt: new Date(scheduledAt).toISOString(),
      notes,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Booking" maxWidth="2xl">
      <div className="px-6 py-4 space-y-6 max-h-[75vh] overflow-y-auto">
        <div className="rounded-xl border border-border bg-surface-sunken/70 p-4 text-xs">
          <p className="font-semibold text-foreground">{booking.patientName ?? 'Patient'}</p>
          <p className="text-foreground-muted mt-0.5">{booking.patientEmail ?? '—'}</p>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Timeline</h3>
          </div>
          <Input
            label="Appointment Date & Time"
            type="datetime-local"
            min={getMinDateTime()}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Tests</h3>
            </div>
            <span className="text-xs font-semibold text-accent">
              {selectedTestIds.length} selected · {formatCurrency(selectedTotal)}
            </span>
          </div>

          {isLoadingTests ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-4">
              {testsByCategory.map((group) => (
                <div key={group.category} className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-surface-sunken border-b border-border">
                    <p className="text-xs font-bold text-foreground-secondary">{group.label}</p>
                  </div>
                  <div className="divide-y divide-divider">
                    {group.tests.map((test) => {
                      const isSelected = selectedTestIds.includes(test.id);
                      return (
                        <label
                          key={test.id}
                          className={cn(
                            'flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors',
                            isSelected ? 'bg-accent-subtle/60' : 'hover:bg-surface-sunken',
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTest(test.id)}
                              className="rounded border-border text-accent focus-ring"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{test.name}</p>
                              <p className="text-[11px] text-foreground-muted">{test.code}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-foreground-secondary shrink-0">
                            {formatCurrency(test.rate)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <label className="block text-xs font-semibold text-foreground-secondary mb-1.5">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Fasting required, special instructions..."
            className="w-full rounded-xl border border-border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus-ring"
          />
        </section>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !scheduledAt || selectedTestIds.length === 0}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
