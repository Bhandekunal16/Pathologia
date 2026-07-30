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
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { DataTable } from '../components/table/DataTable';
import { Input } from '../components/forms/Input';
import { BookingDetailModal } from '../features/test-booking/BookingDetailModal';
import { BookingEditModal } from '../features/test-booking/BookingEditModal';
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
            <button
              type="button"
              onClick={() => (inCart ? removeItem(row.original.id) : addItem(row.original))}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                inCart
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100',
              )}
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
            </button>
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
        id: 'patient',
        header: 'Patient',
        cell: ({ row }) => row.original.patientName ?? '—',
      },
    ];

    if (isPathologist) {
      columns.push({
        id: 'bookedBy',
        header: 'Booked By',
        cell: ({ row }) => {
          const isSelfBooking =
            row.original.patientUserId === row.original.bookedByUserId;
          return isSelfBooking ? (
            <span className="text-emerald-700 font-medium">User (self)</span>
          ) : (
            row.original.bookedByName ?? '—'
          );
        },
      });
    }

    columns.push(
      {
        id: 'tests',
        header: 'Tests',
        cell: ({ row }) => `${row.original.tests.length} test(s)`,
      },
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
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700',
            )}
          >
            {row.original.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => openBookingDetail(row.original)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
              title="View booking details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {canEditBooking(row.original) && (
              <button
                type="button"
                onClick={() => openBookingEdit(row.original)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                title="Edit tests and timeline"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {canEditBooking(row.original) ? (
              <button
                type="button"
                disabled={isCancellingBooking}
                onClick={() => cancelBooking(row.original.id)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        ),
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
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-semibold transition-colors',
                activeTab === 'book' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50',
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
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50',
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
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
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
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Book on behalf of a patient</p>
                  <p className="text-xs text-slate-500">
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
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  />
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!patientEmail || isSendingOtp}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {isSendingOtp ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <div className="md:col-span-2 rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-xs text-teal-800">
                      OTP sent to <strong>{patientEmail}</strong>
                      {verifiedPatientName ? ` for ${verifiedPatientName}` : ''}. Enter it on the confirm step.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {STEPS.map((s, index) => (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                    step === s.id
                      ? 'bg-teal-600 text-white'
                      : index <= stepIndex
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-slate-100 text-slate-500',
                  )}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  {s.label}
                </button>
                {index < STEPS.length - 1 && <div className="w-6 h-px bg-slate-200" />}
              </React.Fragment>
            ))}
            <div className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold">
              <ShoppingCart className="w-4 h-4" />
              {items.length} in cart · {formatCurrency(cartTotal)}
            </div>
          </div>

          {step === 'tests' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
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
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  disabled={!canProceedFromCart}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold disabled:opacity-50"
                >
                  Continue to Cart
                </button>
              </div>
            </div>
          )}

          {step === 'cart' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">Your cart is empty. Add tests to continue.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.code} · {TEST_CATEGORY_LABELS[item.category]}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(item.rate)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="text-sm font-semibold text-slate-700">Total</span>
                    <span className="text-lg font-bold text-teal-700">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('tests')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('schedule')}
                  disabled={!canProceedFromCart}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold disabled:opacity-50"
                >
                  Choose Date & Time
                </button>
              </div>
            </div>
          )}

          {step === 'schedule' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-teal-50 text-teal-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Select appointment date & time</p>
                  <p className="text-xs text-slate-500">Choose when the patient should visit for the tests.</p>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Fasting required, special instructions..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  disabled={!canProceedFromSchedule}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold disabled:opacity-50"
                >
                  Review Booking
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-teal-50 text-teal-700">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Confirm your booking</p>
                  <p className="text-xs text-slate-500">Review details before confirming.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Appointment</span>
                  <span className="font-semibold text-slate-800">
                    {scheduledAt ? formatDate(new Date(scheduledAt).toISOString()) : '—'}
                  </span>
                </div>
                {bookForPatient && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient</span>
                    <span className="font-semibold text-slate-800">{patientEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Tests</span>
                  <span className="font-semibold text-slate-800">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-teal-700">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(item.rate)}</span>
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

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('schedule')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={!canConfirm || isCreatingBooking}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCreatingBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
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
