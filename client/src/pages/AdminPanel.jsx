import { useEffect, useState } from 'react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { getAdminAnalytics, getAdminUsers, updateAdminUserRole } from '../services/adminService';

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      setLoading(true);
      setError('');

      try {
        const [analyticsResponse, usersResponse] = await Promise.all([
          getAdminAnalytics(),
          getAdminUsers(),
        ]);

        if (!isMounted) {
          return;
        }

        setAnalytics(analyticsResponse);
        setUsers(usersResponse);
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const updatedUser = await updateAdminUserRole(userId, role);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const stats = analytics
    ? [
        { label: 'Users', value: analytics.users },
        { label: 'Providers', value: analytics.providers },
        { label: 'Seekers', value: analytics.seekers },
        { label: 'Skills', value: analytics.skills },
        { label: 'Bookings', value: analytics.bookings },
        { label: 'Reviews', value: analytics.reviews },
      ]
    : [];

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: 'calc(100vh - 73px)',
          background: '#C7EABB',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '32px 16px 56px',
            display: 'grid',
            gap: '24px',
          }}
        >
          <section
            style={{
              borderRadius: '32px',
              padding: 'clamp(24px, 4vw, 38px)',
              background: 'linear-gradient(135deg, #020617 0%, #1d4ed8 48%, #0f766e 100%)',
              color: '#f8fafc',
              boxShadow: '0 28px 60px rgba(15, 23, 42, 0.2)',
              display: 'grid',
              gap: '12px',
            }}
          >
            <span
              style={{
                width: 'fit-content',
                padding: '8px 14px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(248, 250, 252, 0.14)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Admin-only access
            </span>
            <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.4rem)', lineHeight: 1.04 }}>
              Control users and validate role-based access.
            </h1>
          </section>

          {error ? (
            <section
              style={{
                borderRadius: '22px',
                padding: '16px 18px',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#b91c1c',
                fontWeight: 700,
              }}
            >
              {error}
            </section>
          ) : null}

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
            }}
          >
            {stats.map((item) => (
              <article
                key={item.label}
                style={{
                  borderRadius: '24px',
                  padding: '22px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  boxShadow: '0 18px 34px rgba(15, 23, 42, 0.06)',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <span style={{ color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                  {item.label}
                </span>
                <strong style={{ fontSize: '1.8rem', color: '#0f172a' }}>
                  {loading ? '-' : item.value}
                </strong>
              </article>
            ))}
          </section>

          <section
            style={{
              borderRadius: '28px',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              boxShadow: '0 20px 42px rgba(15, 23, 42, 0.08)',
              display: 'grid',
              gap: '16px',
            }}
          >
            <div style={{ display: 'grid', gap: '6px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>User roles</h2>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                Promote or downgrade roles to test provider, seeker, and admin access boundaries.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {users.map((user) => (
                <article
                  key={user.id}
                  style={{
                    borderRadius: '22px',
                    padding: '18px',
                    background: 'rgba(15, 23, 42, 0.03)',
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <strong style={{ color: '#0f172a' }}>{user.name}</strong>
                      <span style={{ color: '#475569' }}>{user.email}</span>
                    </div>
                    <span
                      style={{
                        padding: '8px 12px',
                        borderRadius: '999px',
                        background: 'rgba(15, 23, 42, 0.08)',
                        color: '#0f172a',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['seeker', 'provider', 'admin'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleChange(user.id, role)}
                        style={{
                          borderRadius: '999px',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          padding: '10px 14px',
                          background: user.role === role ? '#111827' : '#ffffff',
                          color: user.role === role ? '#ffffff' : '#0f172a',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                        }}
                      >
                        Set {role}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
