import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import PageContainer from './PageContainer';

const footerLinks = [
  { label: 'About', to: '/' },
  { label: 'Explore', to: '/search' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
];

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
];

export default function Footer() {
  return (
    <footer style={{ marginTop: '34px', padding: '0 0 28px' }}>
      <PageContainer>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '32px',
            padding: '28px',
            background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.96) 0%, rgba(15, 23, 42, 0.98) 100%)',
            border: '1px solid rgba(96, 165, 250, 0.14)',
            boxShadow: '0 28px 70px rgba(15, 23, 42, 0.18)',
            color: '#f8fafc',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-30% auto auto -8%',
              width: '240px',
              height: '240px',
              borderRadius: '999px',
              background: 'rgba(37, 99, 235, 0.18)',
              filter: 'blur(16px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 'auto -4% -30% auto',
              width: '260px',
              height: '260px',
              borderRadius: '999px',
              background: 'rgba(15, 118, 110, 0.16)',
              filter: 'blur(18px)',
            }}
          />

          <div style={{ position: 'relative', display: 'grid', gap: '24px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                alignItems: 'start',
              }}
            >
              <div style={{ display: 'grid', gap: '12px' }}>
                <Badge tone="dark" uppercase style={{ width: 'fit-content' }}>
                  Premium local marketplace
                </Badge>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                    lineHeight: 1.1,
                    fontFamily: 'var(--sv-font-display)',
                  }}
                >
                  Build trust quickly with a cleaner shared UI layer.
                </h2>
                <p style={{ margin: 0, color: 'rgba(248, 250, 252, 0.72)', lineHeight: 1.75 }}>
                  SkillVigo now has stronger layout and common components so every screen feels more polished, premium, and consistent by default.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'grid', gap: '10px' }}>
                  <strong style={{ fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Product
                  </strong>
                  {footerLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      style={{ textDecoration: 'none', color: 'rgba(248, 250, 252, 0.76)' }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  <strong style={{ fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Social
                  </strong>
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', color: 'rgba(248, 250, 252, 0.76)' }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                color: 'rgba(248, 250, 252, 0.68)',
              }}
            >
              <small>Copyright {new Date().getFullYear()} SkillVigo. All rights reserved.</small>
              <small>Designed for a cleaner, more premium local product feel.</small>
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
