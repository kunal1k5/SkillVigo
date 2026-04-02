import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import useAuth from '../hooks/useAuth';
import { getDefaultRouteForRole } from '../utils/authRedirect';

const DEMO_CREDENTIALS = {
  email: 'demo@skillvigo.com',
  password: 'Demo@123456',
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authBusy } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await login(formData);
      const nextPath = location.state?.from?.pathname || getDefaultRouteForRole(user.role);
      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

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
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '40px 16px 56px',
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          <section
            style={{
              borderRadius: '32px',
              padding: 'clamp(24px, 4vw, 40px)',
              background: 'linear-gradient(135deg, #020617 0%, #1d4ed8 48%, #0f766e 100%)',
              color: '#f8fafc',
              boxShadow: '0 28px 60px rgba(15, 23, 42, 0.18)',
              display: 'grid',
              gap: '18px',
            }}
          >
            <span
              style={{
                width: 'fit-content',
                padding: '8px 14px',
                borderRadius: '999px',
                background: '#80CBC4',
                border: '1px solid rgba(231, 244, 224, 0.34)',
                color: '#173019',
                boxShadow: '0 10px 22px rgba(79, 107, 75, 0.2)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              JWT authentication
            </span>

            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: 1.04,
                fontFamily: '"Sora", "Segoe UI", sans-serif',
                maxWidth: '10ch',
              }}
            >
              Sign in and continue your local skill workflow.
            </h1>

            <p style={{ margin: 0, maxWidth: '58ch', color: 'rgba(248, 250, 252, 0.82)', lineHeight: 1.7 }}>
              Your session is created by the SkillVigo API and stored as a JWT in localStorage.
            </p>

            <div
              style={{
                borderRadius: '24px',
                padding: '20px',
                background: 'rgba(2, 6, 23, 0.18)',
                display: 'grid',
                gap: '10px',
              }}
            >
              <strong style={{ fontSize: '1.05rem' }}>Demo account</strong>
              <span style={{ color: 'rgba(248, 250, 252, 0.8)' }}>{DEMO_CREDENTIALS.email}</span>
              <span style={{ color: 'rgba(248, 250, 252, 0.8)' }}>{DEMO_CREDENTIALS.password}</span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(DEMO_CREDENTIALS)}
                style={{
                  width: 'fit-content',
                  borderRadius: '999px',
                  borderColor: 'rgba(248, 250, 252, 0.24)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#f8fafc',
                }}
              >
                Fill demo credentials
              </Button>
            </div>
          </section>

          <section
            style={{
              borderRadius: '32px',
              padding: 'clamp(24px, 4vw, 34px)',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              boxShadow: '0 20px 42px rgba(15, 23, 42, 0.08)',
              display: 'grid',
              gap: '18px',
            }}
          >
            <div style={{ display: 'grid', gap: '8px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem' }}>Login</h2>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                Use your email and password to access bookings, chat, and provider actions.
              </p>
            </div>

            {error ? (
              <div
                style={{
                  borderRadius: '18px',
                  padding: '14px 16px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#b91c1c',
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                style={{ borderRadius: '14px', padding: '14px 16px' }}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                required
                style={{ borderRadius: '14px', padding: '14px 16px' }}
              />

              <Button
                type="submit"
                disabled={authBusy}
                style={{
                  borderRadius: '999px',
                  padding: '14px 18px',
                  background: 'linear-gradient(90deg, #1d4ed8 0%, #0f766e 100%)',
                }}
              >
                {authBusy ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p style={{ margin: 0, color: '#475569' }}>
              Need an account?{' '}
              <Link to="/register" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
