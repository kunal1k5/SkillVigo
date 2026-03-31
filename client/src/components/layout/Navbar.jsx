import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import PageContainer from './PageContainer';
import useAuth from '../../hooks/useAuth';
import brandLogo from '../../../logo.png';

const MAIN_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/chat', label: 'Chat' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();
  const lastScrollYRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isBrandHovered, setIsBrandHovered] = useState(false);

  const navLinkClassName = ({ isActive }) =>
    [
      'rounded-full px-4 py-2 text-sm font-bold no-underline transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2',
      isActive
        ? 'bg-emerald-50 text-slate-900 shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_0_22px_rgba(16,185,129,0.22)]'
        : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.14),0_0_18px_rgba(16,185,129,0.18)]',
    ].join(' ');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  return (
    <>
      <div className="h-[135px] md:h-[98px]" />
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '18px',
              flexWrap: 'wrap',
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
                gap: '10px',
                textDecoration: 'none',
                color: isBrandHovered ? '#1d4ed8' : '#0f172a',
                fontWeight: 800,
                fontSize: '1.05rem',
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
                style={{
                  transition: 'letter-spacing 0.2s ease, color 0.2s ease',
                  letterSpacing: isBrandHovered ? '0.02em' : '0',
                }}
              >
                SkillVigo
              </span>
            </Link>

            <div
              className="order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0 pb-2 md:pb-0 flex items-center justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto hide-scrollbar"
              style={{
                flexWrap: 'nowrap',
                flex: 1,
              }}
            >
              {MAIN_LINKS.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                  {item.label}
                </NavLink>
              ))}

              {!loading && currentUser?.role === 'admin' ? (
                <NavLink to="/admin" className={navLinkClassName}>
                  Admin
                </NavLink>
              ) : null}
            </div>

            <div
              className="flex-shrink-0 order-2 md:order-3"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'nowrap',
              }}
            >
              {loading ? null : currentUser ? (
                <>
                  <Link
                    to="/profile"
                    style={{
                      textDecoration: 'none',
                      color: '#475569',
                      fontWeight: 700,
                      padding: '8px 14px',
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
                    style={{
                      textDecoration: 'none',
                      color: '#475569',
                      fontWeight: 700,
                      padding: '8px 14px',
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
                    style={{
                      textDecoration: 'none',
                      color: '#ffffff',
                      fontWeight: 800,
                      padding: '10px 16px',
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
          </nav>
        </PageContainer>
      </header>
    </>
  );
}
