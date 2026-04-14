import { useEffect, useMemo, useState } from 'react';
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
  { id: 'needs-action', label: 'Needs action' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'canceled', label: 'Canceled' },
];

function isProviderRole(role = '') {
  return role === 'provider' || role === 'admin';
}

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

function getInstructorId(booking = {}) {
  return booking.instructor?.id || booking.skill?.instructor?.id || '';
}

function getStudentId(booking = {}) {
  return booking.student?.id || '';
}

function getCounterpartMeta(booking = {}, currentUser = null) {
  if (isProviderRole(currentUser?.role || '')) {
    return {
      label: 'Learner',
      name: booking?.student?.name || 'Learner',
    };
  }

  return {
    label: 'Provider',
    name:
      booking?.instructor?.name ||
      booking?.skill?.instructor?.name ||
      booking?.instructorName ||
      'Provider',
  };
}

function canConfirmBooking(booking, currentUser) {
  if (!booking || !currentUser) {
    return false;
  }

  return currentUser.role === 'admin' || currentUser.id === getInstructorId(booking);
}

function canCompleteBooking(booking, currentUser) {
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

function requiresMyAction(booking, currentUser) {
  if (!booking || !currentUser) {
    return false;
  }

  const status = String(booking.status || '').toLowerCase();

  if (status !== 'pending' && status !== 'confirmed') {
    return false;
  }

  if (isProviderRole(currentUser.role || '')) {
    if (status === 'pending') {
      return canConfirmBooking(booking, currentUser);
    }

    return canCompleteBooking(booking, currentUser);
  }

  return currentUser.id === getStudentId(booking);
}

function getBookingSearchHaystack(booking = {}, currentUser = null) {
  const counterpart = getCounterpartMeta(booking, currentUser);

  return [
    booking.skill?.title,
    booking.skillTitle,
    booking.instructor?.name,
    booking.instructorName,
    booking.student?.name,
    counterpart.name,
    booking.category,
    booking.note,
    booking.location,
    booking.mode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
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

function buildRoleMeta(currentUser) {
  if (isProviderRole(currentUser?.role || '')) {
    return {
      title: 'Manage incoming booking requests and session delivery',
      description:
        'Approve pending requests, complete confirmed sessions, and keep every learner conversation and timing in one clean workspace.',
      primaryCta: 'Explore marketplace',
      emptyTitle: 'No learner requests yet',
      emptyDescription:
        'As soon as someone books your skill, it will appear here with actions to confirm or complete.',
    };
  }

  return {
    title: 'Track your booking requests and upcoming sessions',
    description:
      'See booking status updates, session details, and manage pending requests from one responsive booking page.',
    primaryCta: 'Book a new skill',
    emptyTitle: 'No bookings yet',
    emptyDescription:
      'Book your first skill from search and all upcoming sessions will appear here automatically.',
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

function buildStats(bookings = [], currentUser = null) {
  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;
  const completedCount = bookings.filter((booking) => booking.status === 'completed').length;
  const needsActionCount = bookings.filter((booking) => requiresMyAction(booking, currentUser)).length;
  const completionRate = bookings.length
    ? Math.round((completedCount / bookings.length) * 100)
    : 0;

  return [
    {
      label: 'Total bookings',
      value: bookings.length,
      detail: 'All historical and active booking records in your workspace.',
      accent: '#0f172a',
    },
    {
      label: 'Needs action',
      value: needsActionCount,
      detail: isProviderRole(currentUser?.role || '')
        ? 'Requests that need your confirmation or completion update.'
        : 'Active requests that still need your attention.',
      accent: '#1d4ed8',
    },
    {
      label: 'Upcoming live',
      value: pendingCount + confirmedCount,
      detail: 'Pending plus confirmed sessions that are still active.',
      accent: '#0f766e',
    },
    {
      label: 'Completion rate',
      value: `${completionRate}%`,
      detail: 'Percentage of sessions that reached completed status.',
      accent: '#334155',
    },
  ];
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
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
  };

  return (
    <div className={`rounded-md border p-3 shadow-sm ${toneStyles[tone] || toneStyles.info}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-[13px] opacity-85 sm:text-sm">{description}</p>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            disabled={busy}
            className="inline-flex h-8 min-h-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {busy ? 'Refreshing...' : actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AuthPrompt() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <PageContainer className="flex flex-1 items-center justify-center py-8">
        <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-7">
          <h1 className="flex items-center justify-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
            <Calendar className="h-6 w-6 text-slate-900" /> Sign in to open booking workspace
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-slate-600 sm:text-sm">
            Session confirmations, cancellations, and booking history are available after you sign in.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex h-8 min-h-0 items-center justify-center whitespace-nowrap rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-black"
            >
              Go to login
            </Link>
            <Link
              to="/register"
              className="inline-flex h-8 min-h-0 items-center justify-center whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Create account
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function EmptyBookingsState({ roleMeta }) {
  return (
    <section className="grid min-h-[180px] content-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <span className="inline-flex self-start justify-self-start rounded-sm border border-slate-300 bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
        Booking list is empty
      </span>
      <h2 className="text-[clamp(1.05rem,2.2vw,1.4rem)] font-semibold text-slate-900">{roleMeta.emptyTitle}</h2>
      <p className="max-w-[58ch] text-[13px] leading-6 text-slate-600 sm:text-sm">{roleMeta.emptyDescription}</p>
      <div>
        <Link
          to="/search"
          className="inline-flex h-8 min-h-0 items-center justify-center whitespace-nowrap rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-black"
        >
          Browse skills
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

  const roleMeta = useMemo(() => buildRoleMeta(currentUser), [currentUser]);

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
          description: 'Latest booking statuses and session details are now synced.',
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
      const status = String(booking.status || '').toLowerCase();
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'needs-action'
            ? requiresMyAction(booking, currentUser)
            : status === statusFilter;
      const matchesSearch = query
        ? getBookingSearchHaystack(booking, currentUser).includes(query)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [bookings, currentUser, searchQuery, statusFilter]);

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

  const stats = useMemo(() => buildStats(bookings, currentUser), [bookings, currentUser]);
  const nextBooking = useMemo(() => findNextBooking(bookings), [bookings]);
  const needsActionCount = useMemo(
    () => bookings.filter((booking) => requiresMyAction(booking, currentUser)).length,
    [bookings, currentUser],
  );
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
        description: `${updatedBooking.skillTitle || 'This session'} is now confirmed.`,
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

  const handleCompleteBooking = async (booking) => {
    if (!booking || actionBusyId) {
      return;
    }

    const confirmed = window.confirm(
      `Mark ${booking.skillTitle || booking.skill?.title || 'this booking'} as completed?`,
    );

    if (!confirmed) {
      return;
    }

    setActionBusyId(booking.id);

    try {
      const updatedBooking = await updateBookingStatus(booking.id, 'completed');
      applyBookingUpdate(updatedBooking);
      setFeedback({
        tone: 'success',
        title: 'Booking completed',
        description: `${updatedBooking.skillTitle || 'This session'} has been moved to completed.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'error',
        title: 'Could not complete booking',
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
        description: `${updatedBooking.skillTitle || 'This session'} is now canceled.`,
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

  const counterpart = getCounterpartMeta(nextBooking, currentUser);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-4 sm:py-5">
        <PageContainer maxWidth={1220} className="space-y-4 sm:space-y-5">
          <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4 lg:grid-cols-[minmax(0,1.2fr)_300px]">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <span className="inline-flex self-start justify-self-start rounded-sm border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
                  Booking workspace
                </span>
                <div className="grid gap-2">
                  <h1 className="text-[clamp(0.85rem,1.5vw,1.1rem)] font-semibold leading-tight text-slate-900">
                    {roleMeta.title}
                  </h1>
                  <p className="max-w-[62ch] text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                    {roleMeta.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/search"
                  className="inline-flex h-8 min-h-0 items-center justify-center whitespace-nowrap rounded-lg bg-slate-900 px-3 text-[11px] font-semibold text-white transition hover:bg-black sm:text-xs"
                >
                  {roleMeta.primaryCta}
                </Link>
                <button
                  type="button"
                  onClick={() => loadBookings({ silent: true })}
                  disabled={refreshing || loading}
                  className="inline-flex h-8 min-h-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 sm:text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh bookings'}
                </button>
              </div>
            </div>

            <aside className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <div className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Next session</span>
                <strong className="text-base leading-6 text-slate-900 sm:text-lg">
                  {nextBooking?.skill?.title || nextBooking?.skillTitle || 'No session yet'}
                </strong>
                <span className="text-[13px] leading-5 text-slate-600 sm:text-sm sm:leading-6">
                  {counterpart.label}: {counterpart.name || 'TBD'}
                </span>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Scheduled</p>
                <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-900">
                  {formatShortSchedule(nextBooking?.scheduledAt)}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-slate-600 sm:text-sm sm:leading-6">
                  {nextBooking?.mode || 'Live session'} | {nextBooking?.location || 'Online room'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active</p>
                  <p className="mt-1.5 text-xl font-semibold text-slate-900 sm:text-2xl">{activeBookingsCount}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Needs action</p>
                  <p className="mt-1.5 text-xl font-semibold text-slate-900 sm:text-2xl">{needsActionCount}</p>
                </div>
              </div>
            </aside>
          </section>

          <BookingStats stats={stats} />

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

          <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Session list</p>
                <h2 className="mt-1 text-base font-semibold text-slate-900 sm:text-lg" id="booking-list">
                  Track every session in one place
                </h2>
              </div>

              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    className={`h-8 min-h-0 whitespace-nowrap rounded-lg px-2.5 text-[11px] font-semibold leading-none transition sm:text-xs ${
                      statusFilter === filter.id
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-3.5 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by skill, person, note, or location"
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-900"
              />
            </label>

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <Loader size="lg" message="Loading your bookings..." />
              </div>
            ) : bookings.length === 0 ? (
              <EmptyBookingsState roleMeta={roleMeta} />
            ) : filteredBookings.length === 0 ? (
              <BookingEmptyState onReset={resetFilters} />
            ) : (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]">
                <section className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      currentUser={currentUser}
                      actionBusyId={actionBusyId}
                      isActive={booking.id === selectedBooking?.id}
                      onSelect={(selected) => setSelectedBookingId(selected.id)}
                      onConfirm={
                        canConfirmBooking(booking, currentUser) &&
                        booking.status === 'pending' &&
                        actionBusyId !== booking.id
                          ? handleConfirmBooking
                          : undefined
                      }
                      onComplete={
                        canCompleteBooking(booking, currentUser) &&
                        booking.status === 'confirmed' &&
                        actionBusyId !== booking.id
                          ? handleCompleteBooking
                          : undefined
                      }
                      onCancel={
                        canCancelBooking(booking, currentUser) &&
                        ['pending', 'confirmed'].includes(String(booking.status || '').toLowerCase()) &&
                        actionBusyId !== booking.id
                          ? handleCancelBooking
                          : undefined
                      }
                    />
                  ))}
                </section>

                <aside className="xl:self-start">
                  <BookingDetailsPanel
                    booking={selectedBooking}
                    currentUser={currentUser}
                    actionBusyId={actionBusyId}
                    onConfirm={
                      canConfirmBooking(selectedBooking, currentUser) &&
                      selectedBooking?.status === 'pending' &&
                      actionBusyId !== selectedBooking?.id
                        ? handleConfirmBooking
                        : undefined
                    }
                    onComplete={
                      canCompleteBooking(selectedBooking, currentUser) &&
                      selectedBooking?.status === 'confirmed' &&
                      actionBusyId !== selectedBooking?.id
                        ? handleCompleteBooking
                        : undefined
                    }
                    onCancel={
                      canCancelBooking(selectedBooking, currentUser) &&
                      ['pending', 'confirmed'].includes(String(selectedBooking?.status || '').toLowerCase()) &&
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
