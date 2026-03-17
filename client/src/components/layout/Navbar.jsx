import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import PageContainer from './PageContainer';
import useAuth from '../../hooks/useAuth';

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

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#0f172a' : '#5b6b82',
    textDecoration: 'none',
    fontWeight: isActive ? 800 : 700,
    fontSize: '14px',
    padding: '8px 10px',
    borderBottom: isActive ? '2px solid #1d4ed8' : '2px solid transparent',
    transition: 'color 0.18s ease, border-color 0.18s ease',
    whiteSpace: 'nowrap',
  });

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
      <div style={{ height: '98px' }} />
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '1.05rem',
                fontFamily: 'var(--sv-font-display)',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '999px',
                  background: 'var(--sv-brand)',
                  boxShadow: '0 0 0 6px rgba(37, 99, 235, 0.08)',
                }}
              />
              SkillVigo
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                flexWrap: 'wrap',
                flex: 1,
              }}
            >
              {MAIN_LINKS.map((item) => (
                <NavLink key={item.to} to={item.to} style={navLinkStyle}>
                  {item.label}
                </NavLink>
              ))}

              {!loading && currentUser?.role === 'admin' ? (
                <NavLink to="/admin" style={navLinkStyle}>
                  Admin
                </NavLink>
              ) : null}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
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
                      padding: '8px 10px',
                      whiteSpace: 'nowrap',
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
                      padding: '8px 10px',
                      whiteSpace: 'nowrap',
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
                      whiteSpace: 'nowrap',
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
