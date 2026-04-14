import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookingCard from '../components/booking/BookingCard';
import BookingDetailsPanel from '../components/booking/BookingDetailsPanel';
import BookingEmptyState from '../components/booking/BookingEmptyState';
import BookingStats from '../components/booking/BookingStats';
import Loader from '../components/common/Loader';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import useAuth from '../hooks/useAuth';
import {
  cancelBooking,
  getMyBookings,
  updateBookingStatus,
} from '../services/bookingService';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'canceled', label: 'Canceled' },
];

function sortBookings(bookings = []) {
  const statusRank = {
    pending: 0,
    confirmed: 1,
    completed: 2,
    canceled: 3,
  };

  return [...bookings].sort((first, second) => {
    const statusDifference =
      (statusRank[first.status] ?? 99) - (statusRank[second.status] ?? 99);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return (
      new Date(first.scheduledAt || first.createdAt).getTime() -
      new Date(second.scheduledAt || second.createdAt).getTime()
    );
  });
}

function getBookingSearchHaystack(booking = {}) {
  return [
    booking.skill?.title,
    booking.skillTitle,
    booking.instructor?.name,
    booking.instructorName,
    booking.student?.name,
    booking.category,
    booking.note,
    booking.location,
    booking.mode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getInstructorId(booking = {}) {
  return booking.instructor?.id || booking.skill?.instructor?.id || '';
}

function getStudentId(booking = {}) {
  return booking.student?.id || '';
}

function canConfirmBooking(booking, currentUser) {
  if (!booking || !currentUser) {
    return false;
  }

  return currentUser.role === 'admin' || currentUser.id === getInstructorId(booking);
}

function canCancelBooking(booking, currentUser) {
  if (!booking || !currentUser) {
    return false;
  }

  if (currentUser.role === 'admin') {
    return true;
  }

  return (
    currentUser.id === getInstructorId(booking) ||
    currentUser.id === getStudentId(booking)
  );
}

function buildStats(bookings = []) {
  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;
  const completedCount = bookings.filter((booking) => booking.status === 'completed').length;
  const canceledCount = bookings.filter((booking) => booking.status === 'canceled').length;
  const completionRate = bookings.length
    ? Math.round((completedCount / bookings.length) * 100)
    : 0;

  return {
    completionRate,
    items: [
      {
        label: 'Total bookings',
        value: bookings.length,
        detail: 'Every request, confirmed slot, completed session, and canceled booking in one place.',
        accent: '#111827',
      },
      {
        label: 'Awaiting action',
        value: pendingCount,
        detail: 'Requests that still need provider approval or a final response.',
        accent: '#3f3f46',
      },
      {
        label: 'Upcoming live',
        value: confirmedCount,
        detail: 'Confirmed bookings that are ready for the next session.',
        accent: '#52525b',
      },
      {
        label: 'Wrapped up',
        value: completedCount,
        detail: canceledCount
          ? `${canceledCount} canceled request${canceledCount === 1 ? '' : 's'} are tracked separately.`
          : 'Completed sessions stay here as your clean booking history.',
        accent: '#71717a',
      },
    ],
  };
}

function findNextBooking(bookings = []) {
  const activeBookings = bookings.filter((booking) =>
    ['pending', 'confirmed'].includes(String(booking.status || '').toLowerCase()),
  );

  if (!activeBookings.length) {
    return bookings[0] || null;
  }

  return [...activeBookings].sort(
    (first, second) =>
      new Date(first.scheduledAt || first.createdAt).getTime() -
      new Date(second.scheduledAt || second.createdAt).getTime(),
  )[0];
}

function formatShortSchedule(dateValue) {
  if (!dateValue) {
    return 'Schedule pending';
  }

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

function StatusBanner({
  tone = 'info',
  title,
  description,
  actionLabel,
  onAction,
  busy = false,
}) {
  const toneStyles = {
    info: 'border-slate-200 bg-white text-slate-900',
    success: 'border-slate-900 bg-slate-900 text-white',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
  };

  const buttonClassName =
    tone === 'success'
      ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
      : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50';

  return (
    <div className={`rounded-[28px] border p-4 shadow-sm ${toneStyles[tone] || toneStyles.info}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm opacity-85">{description}</p>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${buttonClassName}`}
          >
            <RefreshCw className="h-4 w-4" />
            {busy ? 'Refreshing...' : actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AuthPrompt() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      <Navbar />
      <PageContainer className="flex flex-1 items-center justify-center py-10">
        <div className="max-w-xl rounded-[32px] border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-900">
            <Calendar className="h-8 w-8 text-slate-900" /> Sign in to manage your bookings
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Upcoming sessions, confirmations, cancellations, and booking history are available after you sign in.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              Go to login
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50"
            >
              Create account
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function EmptyBookingsState() {
  return (
    <section className="grid min-h-[240px] content-center gap-4 rounded-[28px] border border-stone-200 bg-white p-7 shadow-sm">
      <span className="w-fit rounded-full border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-700">
        No bookings yet
      </span>
      <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold text-slate-900">
        Your booking page is ready for the first session.
      </h2>
      <p className="max-w-[58ch] text-sm leading-7 text-slate-600">
        Explore the marketplace, send a booking request to a provider, and the full booking trail will start appearing here.
      </p>
      <div>
        <Link
          to="/search"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
        >
          Browse skills to book
        </Link>
      </div>
    </section>
  );
}

export default function BookingsDashboard() {
  const { currentUser, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionBusyId, setActionBusyId] = useState('');
  const [feedback, setFeedback] = useState({ tone: 'success', title: '', description: '' });

  useEffect(() => {
    if (!feedback.title) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback({ tone: 'success', title: '', description: '' });
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback.title]);

  const loadBookings = async ({ silent = false } = {}) => {
    if (!isAuthenticated) {
      setBookings([]);
      setSelectedBookingId('');
      setLoading(false);
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getMyBookings();
      const nextBookings = sortBookings(Array.isArray(response) ? response : []);

      setBookings(nextBookings);
      setSelectedBookingId((currentId) =>
        nextBookings.some((booking) => booking.id === currentId)
          ? currentId
          : nextBookings[0]?.id || '',
      );

      if (silent) {
        setFeedback({
          tone: 'success',
          title: 'Bookings refreshed',
          description: 'Your latest booking status and session details are now synced.',
        });
      }
    } catch (error) {
      setFeedback({
        tone: 'error',
        title: 'Could not load bookings',
        description: error.message || 'Please try again in a moment.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [isAuthenticated]);

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === 'all' || String(booking.status || '').toLowerCase() === statusFilter;
      const matchesSearch = query ? getBookingSearchHaystack(booking).includes(query) : true;
      return matchesStatus && matchesSearch;
    });
  }, [bookings, searchQuery, statusFilter]);

  useEffect(() => {
    if (!filteredBookings.length) {
      setSelectedBookingId('');
      return;
    }

    if (!filteredBookings.some((booking) => booking.id === selectedBookingId)) {
      setSelectedBookingId(filteredBookings[0].id);
    }
  }, [filteredBookings, selectedBookingId]);

  const selectedBooking = useMemo(
    () =>
      filteredBookings.find((booking) => booking.id === selectedBookingId) ||
      filteredBookings[0] ||
      null,
    [filteredBookings, selectedBookingId],
  );
  const stats = useMemo(() => buildStats(bookings), [bookings]);
  const nextBooking = useMemo(() => findNextBooking(bookings), [bookings]);
  const activeBookingsCount = useMemo(
    () =>
      bookings.filter((booking) =>
        ['pending', 'confirmed'].includes(String(booking.status || '').toLowerCase()),
      ).length,
    [bookings],
  );

  const applyBookingUpdate = (updatedBooking) => {
    if (!updatedBooking?.id) {
      return;
    }

    setBookings((currentBookings) =>
      sortBookings(
        currentBookings.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking,
        ),
      ),
    );
    setSelectedBookingId(updatedBooking.id);
  };

  const handleConfirmBooking = async (booking) => {
    if (!booking || actionBusyId) {
      return;
    }

    setActionBusyId(booking.id);

    try {
      const updatedBooking = await updateBookingStatus(booking.id, 'confirmed');
      applyBookingUpdate(updatedBooking);
      setFeedback({
        tone: 'success',
        title: 'Booking confirmed',
        description: `${updatedBooking.skillTitle || 'This session'} is now confirmed and ready to go live.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'error',
        title: 'Could not confirm booking',
        description: error.message || 'Please try again in a moment.',
      });
    } finally {
      setActionBusyId('');
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!booking || actionBusyId) {
      return;
    }

    const confirmed = window.confirm(
      `Cancel ${booking.skillTitle || booking.skill?.title || 'this booking'}?`,
    );

    if (!confirmed) {
      return;
    }

    setActionBusyId(booking.id);

    try {
      const updatedBooking = await cancelBooking(booking.id);
      applyBookingUpdate(updatedBooking);
      setFeedback({
        tone: 'success',
        title: 'Booking canceled',
        description: `${updatedBooking.skillTitle || 'This session'} has been marked as canceled.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'error',
        title: 'Could not cancel booking',
        description: error.message || 'Please try again in a moment.',
      });
    } finally {
      setActionBusyId('');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  if (!isAuthenticated) {
    return <AuthPrompt />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      <Navbar />

      <main className="flex-1 py-8">
        <PageContainer maxWidth={1320} className="space-y-6">
          <section className="grid gap-6 rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-[minmax(0,1.2fr)_320px]">
            <div className="grid gap-5">
              <div className="grid gap-3">
                <span className="w-fit rounded-full border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-stone-700">
                  Booking workspace
                </span>
                <div className="grid gap-2">
                  <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-slate-900">
                    My bookings
                  </h1>
                  <p className="max-w-[62ch] text-sm leading-7 text-slate-600">
                    Track booking requests, review session details, and manage upcoming classes without leaving the same page.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Book a new skill
                </Link>
                <a
                  href="#booking-list"
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50"
                >
                  Jump to my sessions
                </a>
              </div>
            </div>

            <aside className="grid gap-3 rounded-[28px] border border-stone-200 bg-stone-50 p-5">
              <div className="grid gap-1">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                  Next session
                </span>
                <strong className="text-lg leading-7 text-slate-900">
                  {nextBooking?.skill?.title || nextBooking?.skillTitle || nextBooking?.title || 'No session yet'}
                </strong>
                <span className="text-sm leading-6 text-slate-600">
                  {nextBooking?.skill?.instructor?.name ||
                    nextBooking?.instructor?.name ||
                    nextBooking?.instructorName ||
                    'Provider will appear here'}
                </span>
              </div>

              <div className="rounded-[22px] border border-stone-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Scheduled
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                  {formatShortSchedule(nextBooking?.scheduledAt)}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {nextBooking?.mode || 'Live session'} | {nextBooking?.location || 'Online room'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-stone-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Active
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{activeBookingsCount}</p>
                </div>
                <div className="rounded-[22px] border border-stone-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Completion
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.completionRate}%</p>
                </div>
              </div>
            </aside>
          </section>

          <BookingStats stats={stats.items} />

          {feedback.title ? (
            <StatusBanner
              tone={feedback.tone}
              title={feedback.title}
              description={feedback.description}
              actionLabel="Refresh"
              onAction={() => loadBookings({ silent: true })}
              busy={refreshing}
            />
          ) : null}

          <section className="grid gap-5 rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Session list
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900" id="booking-list">
                  Track every session in one place
                </h2>
              </div>

              <button
                type="button"
                onClick={() => loadBookings({ silent: true })}
                disabled={refreshing || loading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh bookings'}
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-3.5 text-stone-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by skill, coach, note, or location"
                  className="w-full rounded-2xl border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-900"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      statusFilter === filter.id
                        ? 'bg-slate-900 text-white'
                        : 'border border-stone-300 bg-white text-slate-600 hover:bg-stone-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <Loader size="lg" message="Loading your bookings..." />
              </div>
            ) : bookings.length === 0 ? (
              <EmptyBookingsState />
            ) : filteredBookings.length === 0 ? (
              <BookingEmptyState onReset={resetFilters} />
            ) : (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_420px]">
                <section className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isActive={booking.id === selectedBooking?.id}
                      onSelect={(selected) => setSelectedBookingId(selected.id)}
                      onConfirm={
                        canConfirmBooking(booking, currentUser) && actionBusyId !== booking.id
                          ? handleConfirmBooking
                          : undefined
                      }
                      onCancel={
                        canCancelBooking(booking, currentUser) && actionBusyId !== booking.id
                          ? handleCancelBooking
                          : undefined
                      }
                    />
                  ))}
                </section>

                <aside className="xl:self-start">
                  <BookingDetailsPanel
                    booking={selectedBooking}
                    onConfirm={
                      canConfirmBooking(selectedBooking, currentUser) &&
                      actionBusyId !== selectedBooking?.id
                        ? handleConfirmBooking
                        : undefined
                    }
                    onCancel={
                      canCancelBooking(selectedBooking, currentUser) &&
                      actionBusyId !== selectedBooking?.id
                        ? handleCancelBooking
                        : undefined
                    }
                  />
                </aside>
              </div>
            )}
          </section>
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
