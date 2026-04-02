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
    <footer style={{ marginTop: '34px', padding: '0 0 28px', background: '#C7EABB' }}>
      <PageContainer>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '32px',
            padding: '28px',
            background: '#C7EABB',
            border: '1px solid rgba(95, 127, 84, 0.28)',
            boxShadow: '0 22px 52px rgba(84, 117, 71, 0.12)',
            color: '#1e3520',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-30% auto auto -8%',
              width: '240px',
              height: '240px',
              borderRadius: '999px',
              background: 'rgba(132, 177, 121, 0.26)',
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
              background: 'rgba(95, 127, 84, 0.14)',
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
                <Badge tone="dark" uppercase style={{ width: 'fit-content', background: '#4f6b4b', borderColor: '#4f6b4b' }}>
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
                <p style={{ margin: 0, color: '#4d664a', lineHeight: 1.75 }}>
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
                      className="sv-footer-link"
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
                      className="sv-footer-link"
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
                background: 'linear-gradient(90deg, rgba(95, 127, 84, 0.24) 0%, rgba(95, 127, 84, 0.06) 100%)',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                color: '#547050',
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
