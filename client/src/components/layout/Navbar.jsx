import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, LayoutDashboard, Calendar, MessageSquare, User } from 'lucide-react';
import Button from '../common/Button';
import PageContainer from './PageContainer';
import useAuth from '../../hooks/useAuth';
import brandLogo from '../../assets/image/logo.jpeg';

const MAIN_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: Calendar },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/profile', label: 'Profile', icon: User },
];

const MOBILE_MENU_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: Calendar },
  { to: '/chat', label: 'Messages', icon: MessageSquare },
  { to: '/profile', label: 'Profile', icon: User },
];

function getInitials(name = '') {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'SV';
  }

  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading, logout } = useAuth();
  const lastScrollYRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isBrandHovered, setIsBrandHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClassName = ({ isActive }) => {
    return [
      'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold no-underline transition-all duration-200 lg:px-5',
      'focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2',
      isActive
        ? 'bg-emerald-50 text-slate-900 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
    ].join(' ');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mobileProfileName = currentUser?.name || 'Guest';
  const mobileProfileRole = currentUser?.role ? `${currentUser.role} account` : 'SkillVigo member';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;
      const scrollDelta = currentScrollY - lastScrollY;

      if (currentScrollY <= 24) {
        setIsVisible(true);
      } else if (scrollDelta > 8) {
        setIsVisible(false);
      } else if (scrollDelta < -8) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="h-[98px]" />
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 40,
          padding: '14px 0 0',
          transform: isVisible ? 'translateY(0)' : 'translateY(calc(-100% - 16px))',
          opacity: isVisible ? 1 : 0.98,
          transition: 'transform 0.24s ease, opacity 0.24s ease',
        }}
      >
        <PageContainer>
          <nav
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'nowrap',
              padding: '16px 18px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid rgba(148, 163, 184, 0.14)',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Link
              to="/"
              className="order-1 flex-shrink-0"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: isBrandHovered ? '#1d4ed8' : '#0f172a',
                fontWeight: 800,
                fontSize: '0.95rem',
                fontFamily: 'var(--sv-font-display)',
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s ease, color 0.2s ease',
                transform: isBrandHovered ? 'translateY(-1px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setIsBrandHovered(true)}
              onMouseLeave={() => setIsBrandHovered(false)}
            >
              <span
                style={{
                  width: '42px',
                  height: '42px',
                  flexShrink: 0,
                  borderRadius: '999px',
                  background: isBrandHovered
                    ? 'linear-gradient(135deg, rgba(219, 234, 254, 0.98) 0%, rgba(204, 251, 241, 0.98) 100%)'
                    : 'rgba(255, 255, 255, 0.92)',
                  boxShadow: isBrandHovered
                    ? '0 0 0 1px rgba(37, 99, 235, 0.16), 0 16px 28px rgba(37, 99, 235, 0.18)'
                    : '0 12px 26px rgba(15, 23, 42, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  padding: '4px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                  transform: isBrandHovered ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <img
                  src={brandLogo}
                  alt="SkillVigo logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '999px',
                    objectFit: 'contain',
                    display: 'block',
                    transition: 'transform 0.2s ease',
                    transform: isBrandHovered ? 'scale(1.05)' : 'scale(1)',
                  }}
                />
              </span>
              <span
                className="hidden lg:block text-[1.1rem] tracking-tight shrink-0"
                style={{
                  transition: 'letter-spacing 0.2s ease, color 0.2s ease',
                  letterSpacing: isBrandHovered ? '0.01em' : '-0.01em',
                }}
              >
                SkillVigo
              </span>
            </Link>

            <div
              className="hidden md:flex order-2 flex-1 items-center justify-center gap-1 lg:gap-3 xl:gap-4"
            >
              {MAIN_LINKS.map((item) => {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => {
                      return [
                        'inline-flex items-center justify-center gap-1.5 lg:gap-2 rounded-full px-3 py-2 lg:px-4 lg:py-2.5 text-[13px] lg:text-[14px] font-semibold no-underline transition-all duration-200',
                        isActive
                          ? 'text-slate-900 bg-slate-50'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
                      ].join(' ');
                    }}
                    title={item.label}
                    aria-label={item.label}
                  >
                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </NavLink>
                );
              })}

              {!loading && currentUser?.role === 'admin' ? (
                <NavLink to="/admin" className={navLinkClassName}>
                  Admin
                </NavLink>
              ) : null}
            </div>

            <div
              className="flex-shrink-0 order-3"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'nowrap',
              }}
            >
              {!loading ? (
                <Link
                  to="/profile"
                  className="md:hidden inline-flex max-w-[118px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-slate-700 transition hover:border-blue-200 hover:bg-white hover:text-slate-900 sm:max-w-[132px]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-blue-700 to-teal-600 text-xs font-bold text-white">
                    {getInitials(mobileProfileName)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold max-[420px]:hidden">{mobileProfileName}</span>
                  </span>
                </Link>
              ) : null}

              <div className="hidden md:flex md:items-center md:gap-2">
                {loading ? null : currentUser ? (
                  <>
                    <Link
                      to="/profile"
                      className="px-3 py-1.5 lg:px-4 lg:py-2 text-[13px] lg:text-[14px]"
                      style={{
                        textDecoration: 'none',
                        color: '#475569',
                        fontWeight: 700,
                        borderRadius: '999px',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 0 0 1px rgba(16, 185, 129, 0)',
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = '#ffffff';
                        event.currentTarget.style.color = '#0f172a';
                        event.currentTarget.style.boxShadow =
                          '0 0 0 1px rgba(16, 185, 129, 0.12), 0 0 18px rgba(16, 185, 129, 0.16)';
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = 'transparent';
                        event.currentTarget.style.color = '#475569';
                        event.currentTarget.style.boxShadow = '0 0 0 1px rgba(16, 185, 129, 0)';
                      }}
                    >
                      {currentUser.name}
                    </Link>
                    <Button variant="secondary" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-2 py-1.5 lg:px-3 lg:py-2 text-[13px] lg:text-[14px]"
                      style={{
                        textDecoration: 'none',
                        color: '#475569',
                        fontWeight: 700,
                        borderRadius: '999px',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 0 0 1px rgba(16, 185, 129, 0)',
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = '#ffffff';
                        event.currentTarget.style.color = '#0f172a';
                        event.currentTarget.style.boxShadow =
                          '0 0 0 1px rgba(16, 185, 129, 0.12), 0 0 18px rgba(16, 185, 129, 0.16)';
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = 'transparent';
                        event.currentTarget.style.color = '#475569';
                        event.currentTarget.style.boxShadow = '0 0 0 1px rgba(16, 185, 129, 0)';
                      }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 lg:px-5 lg:py-2.5 text-[13px] lg:text-[14px]"
                      style={{
                        textDecoration: 'none',
                        color: '#ffffff',
                        fontWeight: 800,
                        borderRadius: '999px',
                        background: 'linear-gradient(90deg, #1d4ed8 0%, #0f766e 100%)',
                        boxShadow: '0 10px 24px rgba(15, 118, 110, 0.22)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.transform = 'translateY(-1px)';
                        event.currentTarget.style.filter = 'brightness(1.03)';
                        event.currentTarget.style.boxShadow =
                          '0 0 0 1px rgba(45, 212, 191, 0.18), 0 0 22px rgba(16, 185, 129, 0.28)';
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.transform = 'translateY(0)';
                        event.currentTarget.style.filter = 'brightness(1)';
                        event.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 118, 110, 0.22)';
                      }}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

                <button
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  ) : (
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                     </svg>
                  )}
                </button>
              </div>

              {isMobileMenuOpen && (
                <div
                  className="md:hidden absolute top-[calc(100%+8px)] left-0 right-0 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-2 z-50 transform origin-top transition-all"
                  style={{
                    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.1)',
                  }}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-blue-700 to-teal-600 text-sm font-bold text-white">
                        {getInitials(mobileProfileName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{mobileProfileName}</p>
                        <p className="truncate text-xs text-slate-500">{mobileProfileRole}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to="/profile"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        My Skills
                      </Link>
                      {!loading && currentUser?.role && ['provider', 'admin'].includes(currentUser.role) ? (
                        <Link
                          to="/create-skill"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                        >
                          Add Skill
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  {!loading && !currentUser ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                      >
                        Register
                      </Link>
                    </div>
                  ) : null}

                  {MOBILE_MENU_LINKS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `inline-flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl no-underline transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                    </NavLink>
                  ))}

                  {!loading && currentUser?.role === 'admin' && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `px-4 py-3 text-sm font-bold rounded-xl no-underline transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      Admin
                    </NavLink>
                  )}

                  {!loading && currentUser ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Logout
                    </button>
                  ) : null}
                </div>
              )}
            </nav>
          </PageContainer>
        </header>
    </>
  );
}
