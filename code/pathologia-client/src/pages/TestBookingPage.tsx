import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Eye,
  Mail,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { DropdownMenu } from '../components/common/DropdownMenu';
import { DataTable } from '../components/table/DataTable';
import { Input } from '../components/forms/Input';
import { IconButton } from '../components/ui/IconButton';
import { Button } from '../components/ui/Button';
import { WizardFooter } from '../components/common/WizardFooter';
import { BookingDetailModal } from '../features/test-booking/BookingDetailModal';
import { BookingEditModal } from '../features/test-booking/BookingEditModal';
import { BookingStepper } from '../features/test-booking/BookingStepper';
import { BookingCartSummary } from '../features/test-booking/BookingCartSummary';
import { useAuth } from '../hooks/useAuth';
import { usePathologyTests } from '../hooks/usePathologyTests';
import { useTestBookings } from '../hooks/useTestBookings';
import { useCartStore } from '../store/cartStore';
import {
  PathologyTest,
  TEST_CATEGORY_LABELS,
} from '../types/pathology-test.types';
import { TestBooking, UpdateTestBookingPayload } from '../types/test-booking.types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { cn } from '../lib/utils';

type PageTab = 'book' | 'bookings';
type BookingStep = 'tests' | 'cart' | 'schedule' | 'confirm';

const STEPS: { id: BookingStep; label: string }[] = [
  { id: 'tests', label: 'Select Tests' },
  { id: 'cart', label: 'Cart' },
  { id: 'schedule', label: 'Date & Time' },
  { id: 'confirm', label: 'Confirm' },
];

function getMinDateTime(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 30);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function canEditBooking(booking: TestBooking): boolean {
  return (
    booking.status === 'CONFIRMED' && new Date(booking.scheduledAt) > new Date()
  );
}

export const TestBookingPage: React.FC = () => {
  const { user } = useAuth();
  const isPathologist = user?.role === 'PATHOLOGIST';

  const [activeTab, setActiveTab] = useState<PageTab>('book');
  const [step, setStep] = useState<BookingStep>('tests');
  const [search, setSearch] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [bookForPatient, setBookForPatient] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedPatientName, setVerifiedPatientName] = useState('');

  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsLimit, setBookingsLimit] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<TestBooking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<TestBooking | null>(null);

  const { items, addItem, removeItem, clearCart, hasItem, totalAmount } = useCartStore();

  const { testsData, isLoadingTests } = usePathologyTests({
    page: 1,
    limit: 100,
    search,
    status: 'ACTIVE',
  });

  const { testsData: allTestsData, isLoadingTests: isLoadingAllTests } = usePathologyTests({
    page: 1,
    limit: 100,
    search: '',
    status: 'ACTIVE',
  });

  const {
    bookingsData,
    isLoadingBookings,
    sendOtp,
    isSendingOtp,
    createBooking,
    isCreatingBooking,
    cancelBooking,
    isCancellingBooking,
    updateBooking,
    isUpdatingBooking,
  } = useTestBookings({ page: bookingsPage, limit: bookingsLimit });

  const cartTotal = totalAmount();
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const testColumns = useMemo<ColumnDef<PathologyTest>[]>(
    () => [
      { accessorKey: 'name', header: 'Test Name' },
      { accessorKey: 'code', header: 'Code' },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => TEST_CATEGORY_LABELS[row.original.category],
      },
      {
        accessorKey: 'rate',
        header: 'Rate',
        cell: ({ row }) => formatCurrency(row.original.rate),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const inCart = hasItem(row.original.id);
          return (
            <Button
              type="button"
              size="sm"
              variant={inCart ? 'danger' : 'primary'}
              onClick={() => (inCart ? removeItem(row.original.id) : addItem(row.original))}
              className={inCart ? '' : undefined}
            >
              {inCart ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  Remove
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </>
              )}
            </Button>
          );
        },
      },
    ],
    [addItem, hasItem, removeItem],
  );

  const openBookingDetail = (booking: TestBooking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const openBookingEdit = (booking: TestBooking) => {
    setEditingBooking(booking);
    setIsEditOpen(true);
  };

  const handleSaveBookingEdit = async (id: string, payload: UpdateTestBookingPayload) => {
    await updateBooking({ id, payload });
    setIsEditOpen(false);
    setEditingBooking(null);
  };

  const bookingColumns = useMemo<ColumnDef<TestBooking>[]>(() => {
    const columns: ColumnDef<TestBooking>[] = [
      {
        accessorKey: 'scheduledAt',
        header: 'Appointment',
        cell: ({ row }) => formatDate(row.original.scheduledAt),
      },
      {
        id: 'summary',
        header: 'Booking',
        cell: ({ row }) => {
          const booking = row.original;
          return (
            <div>
              <div className="text-xs font-semibold text-foreground">
                {booking.tests.length} test(s)
                {booking.patientName ? ` · ${booking.patientName}` : ''}
              </div>
              {isPathologist && (
                <div className="text-xs text-foreground-muted mt-0.5">
                  {booking.patientUserId === booking.bookedByUserId
                    ? 'User (self)'
                    : booking.bookedByName ?? '—'}
                </div>
              )}
            </div>
          );
        },
      },
    ];

    columns.push(
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ row }) => formatCurrency(row.original.totalAmount),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold',
              row.original.status === 'CONFIRMED'
                ? 'bg-success-muted text-success'
                : 'bg-danger-muted text-danger',
            )}
          >
            {row.original.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const booking = row.original;
          const editable = canEditBooking(booking);
          const menuItems = [
            ...(editable
              ? [
                  {
                    id: 'edit',
                    label: 'Edit booking',
                    icon: <Pencil className="w-4 h-4" />,
                    onClick: () => openBookingEdit(booking),
                  },
                  {
                    id: 'cancel',
                    label: 'Cancel booking',
                    icon: <X className="w-4 h-4" />,
                    variant: 'danger' as const,
                    disabled: isCancellingBooking,
                    onClick: () => cancelBooking(booking.id),
                  },
                ]
              : []),
          ];

          return (
            <div className="flex items-center justify-end gap-1">
              <IconButton
                variant="teal"
                title="View booking details"
                aria-label="View booking details"
                onClick={() => openBookingDetail(booking)}
              >
                <Eye className="w-4 h-4" />
              </IconButton>
              {menuItems.length > 0 && (
                <DropdownMenu items={menuItems} triggerLabel="Booking actions" />
              )}
            </div>
          );
        },
      },
    );

    return columns;
  }, [cancelBooking, isCancellingBooking, isPathologist]);

  const handleSendOtp = async () => {
    const result = await sendOtp({ patientEmail });
    setOtpSent(true);
    setVerifiedPatientName(result.data?.patientName ?? '');
  };

  const handleConfirmBooking = async () => {
    if (!scheduledAt || items.length === 0) return;

    await createBooking({
      testIds: items.map((item) => item.id),
      scheduledAt: new Date(scheduledAt).toISOString(),
      notes: notes || undefined,
      patientEmail: bookForPatient ? patientEmail : undefined,
      otp: bookForPatient ? otp : undefined,
    });

    clearCart();
    setStep('tests');
    setScheduledAt('');
    setNotes('');
    setPatientEmail('');
    setOtp('');
    setOtpSent(false);
    setVerifiedPatientName('');
    setBookForPatient(false);
    setActiveTab('bookings');
  };

  const canProceedFromCart = items.length > 0;
  const canProceedFromSchedule = !!scheduledAt;
  const canConfirm =
    canProceedFromSchedule &&
    (!bookForPatient || (otpSent && otp.length === 6));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Booking"
        description={
          isPathologist
            ? 'Book tests for patients or review appointments booked by users.'
            : 'Select pathology tests, add them to your cart, and schedule an appointment.'
        }
        action={
          <div className="inline-flex rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-semibold transition-colors',
                activeTab === 'book' ? 'accent-glass rounded-lg' : 'text-foreground-muted hover:bg-surface-sunken',
              )}
            >
              Book Tests
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-semibold transition-colors',
                activeTab === 'bookings'
                  ? 'accent-glass rounded-lg'
                  : 'text-foreground-muted hover:bg-surface-sunken',
              )}
            >
              {isPathologist ? 'Patient Bookings' : 'My Bookings'}
            </button>
          </div>
        }
      />

      {activeTab === 'book' ? (
        <div className="space-y-6">
          {isPathologist && (
            <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookForPatient}
                  onChange={(e) => {
                    setBookForPatient(e.target.checked);
                    setOtpSent(false);
                    setOtp('');
                    setVerifiedPatientName('');
                  }}
                  className="rounded border-border text-accent focus-ring"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Book on behalf of a patient</p>
                  <p className="text-xs text-foreground-muted">
                    An OTP will be sent to the patient&apos;s registered email for authorization.
                  </p>
                </div>
              </label>

              {bookForPatient && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Patient Email"
                    type="email"
                    placeholder="patient@example.com"
                    value={patientEmail}
                    onChange={(e) => {
                      setPatientEmail(e.target.value);
                      setOtpSent(false);
                      setOtp('');
                    }}
                    leftIcon={<Mail className="w-4 h-4 text-foreground-subtle" />}
                  />
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!patientEmail || isSendingOtp}
                      className="sidebar-action-btn"
                    >
                      <Send className="w-4 h-4" />
                      {isSendingOtp ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <div className="md:col-span-2 rounded-xl border border-accent-muted bg-accent-subtle/60 p-3 text-xs text-accent">
                      OTP sent to <strong>{patientEmail}</strong>
                      {verifiedPatientName ? ` for ${verifiedPatientName}` : ''}. Enter it on the confirm step.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <BookingStepper
              steps={STEPS}
              currentStepId={step}
              currentStepIndex={stepIndex}
            />
            <BookingCartSummary itemCount={items.length} totalAmount={cartTotal} />
          </div>

          {step === 'tests' && (
            <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search tests by name or code..."
              />
              <DataTable
                columns={testColumns}
                data={testsData?.items ?? []}
                isLoading={isLoadingTests}
                emptyTitle="No tests available"
                emptyDescription="No active tests are available for booking."
              />
              <WizardFooter
                showBack={false}
                onPrimary={() => setStep('cart')}
                primaryLabel="Continue to Cart"
                primaryDisabled={!canProceedFromCart}
              />
            </div>
          )}

          {step === 'cart' && (
            <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-foreground-muted">Your cart is empty. Add tests to continue.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-foreground-muted">{item.code} · {TEST_CATEGORY_LABELS[item.category]}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground">{formatCurrency(item.rate)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-danger hover:bg-danger-muted transition-colors"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="text-sm font-semibold text-foreground-secondary">Total</span>
                    <span className="text-lg font-bold text-accent">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              )}
              <WizardFooter
                onBack={() => setStep('tests')}
                onPrimary={() => setStep('schedule')}
                primaryLabel="Choose Date & Time"
                primaryDisabled={!canProceedFromCart}
              />
            </div>
          )}

          {step === 'schedule' && (
            <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-subtle text-accent">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Select appointment date & time</p>
                  <p className="text-xs text-foreground-muted">Choose when the patient should visit for the tests.</p>
                </div>
              </div>
              <Input
                label="Appointment Date & Time"
                type="datetime-local"
                min={getMinDateTime()}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Fasting required, special instructions..."
                  className="w-full rounded-xl border border-border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus-ring"
                />
              </div>
              <WizardFooter
                onBack={() => setStep('cart')}
                onPrimary={() => setStep('confirm')}
                primaryLabel="Review Booking"
                primaryDisabled={!canProceedFromSchedule}
              />
            </div>
          )}

          {step === 'confirm' && (
            <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-5 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-subtle text-accent">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Confirm your booking</p>
                  <p className="text-xs text-foreground-muted">Review details before confirming.</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-sunken p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Appointment</span>
                  <span className="font-semibold text-foreground">
                    {scheduledAt ? formatDate(new Date(scheduledAt).toISOString()) : '—'}
                  </span>
                </div>
                {bookForPatient && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Patient</span>
                    <span className="font-semibold text-foreground">{patientEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Tests</span>
                  <span className="font-semibold text-foreground">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Total</span>
                  <span className="font-bold text-accent">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-foreground-secondary">{item.name}</span>
                    <span className="font-semibold text-foreground">{formatCurrency(item.rate)}</span>
                  </div>
                ))}
              </div>

              {bookForPatient && (
                <Input
                  label="Patient OTP"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              )}

              <WizardFooter
                onBack={() => setStep('schedule')}
                onPrimary={handleConfirmBooking}
                primaryLabel="Confirm Booking"
                primaryDisabled={!canConfirm}
                primaryLoading={isCreatingBooking}
                primaryIcon={<CheckCircle2 className="w-4 h-4" />}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-5 shadow-card">
          <DataTable
            columns={bookingColumns}
            data={bookingsData?.items ?? []}
            isLoading={isLoadingBookings}
            emptyTitle="No bookings found"
            emptyDescription={
              isPathologist
                ? 'User bookings and appointments you created will appear here.'
                : 'Your confirmed and cancelled bookings will appear here.'
            }
            currentPage={bookingsPage}
            totalPages={bookingsData?.totalPages ?? 1}
            totalRecords={bookingsData?.total ?? 0}
            limit={bookingsLimit}
            onPageChange={setBookingsPage}
            onLimitChange={(value) => {
              setBookingsLimit(value);
              setBookingsPage(1);
            }}
          />
        </div>
      )}

      <BookingDetailModal
        isOpen={isDetailOpen}
        booking={selectedBooking}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBooking(null);
        }}
        onEdit={
          selectedBooking && canEditBooking(selectedBooking)
            ? () => {
                setIsDetailOpen(false);
                openBookingEdit(selectedBooking);
              }
            : undefined
        }
      />

      <BookingEditModal
        isOpen={isEditOpen}
        booking={editingBooking}
        availableTests={allTestsData?.items ?? []}
        isLoadingTests={isLoadingAllTests}
        isSaving={isUpdatingBooking}
        onClose={() => {
          setIsEditOpen(false);
          setEditingBooking(null);
        }}
        onSave={handleSaveBookingEdit}
      />
    </div>
  );
};
