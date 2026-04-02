import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import PageContainer from './PageContainer';

function BoxIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" strokeLinejoin="round" />
      <path d="M5 7L12 11L19 7" strokeLinejoin="round" />
      <path d="M12 11V21" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8L15.8 6.2" strokeLinecap="round" />
      <path d="M8.2 13.2L15.8 17.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M7 17L17 7" strokeLinecap="round" />
      <path d="M9 7H17V15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TwitterIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        d="M22 5.9C21.3 6.2 20.5 6.4 19.7 6.5C20.5 6 21.1 5.2 21.4 4.3C20.7 4.8 19.8 5.1 18.9 5.3C18.2 4.5 17.2 4 16.1 4C14 4 12.4 5.9 12.9 7.8C9.8 7.6 7.1 6.2 5.2 4C4.2 5.8 4.7 8.1 6.3 9.2C5.7 9.2 5.1 9 4.6 8.7C4.6 10.5 5.9 12.1 7.6 12.4C7 12.6 6.4 12.6 5.8 12.4C6.3 14 7.8 15.1 9.5 15.1C7.9 16.4 5.8 17 3.7 16.7C5.4 17.8 7.5 18.4 9.8 18.4C16.2 18.4 19.9 13 19.7 8.1C20.5 7.5 21.3 6.8 22 5.9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedInIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 10V16" strokeLinecap="round" />
      <path d="M8 8H8.01" strokeLinecap="round" />
      <path d="M12 16V12.8C12 11.8 12.8 11 13.8 11C14.8 11 15.6 11.8 15.6 12.8V16" strokeLinecap="round" />
      <path d="M12 10V16" strokeLinecap="round" />
    </svg>
  );
}

function InstagramIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M17.3 6.7H17.31" strokeLinecap="round" />
    </svg>
  );
}

function GitHubIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path
        d="M9 19C5.5 20 5.5 17 4 16.5M20 15.5V18.5C20 18.9 19.8 19.3 19.5 19.6C19.2 19.9 18.8 20 18.4 20H15.5V17.7C15.5 17 15.3 16.4 14.9 15.9C17.8 15.6 20.8 14.5 20.8 9.8C20.8 8.6 20.3 7.5 19.5 6.6C19.9 5.4 19.9 4.1 19.4 3C19.4 3 18.4 2.7 15.5 4.7C13.6 4.2 11.6 4.2 9.7 4.7C6.8 2.7 5.8 3 5.8 3C5.3 4.1 5.3 5.4 5.7 6.6C4.9 7.5 4.4 8.6 4.4 9.8C4.4 14.5 7.4 15.6 10.3 15.9C9.9 16.4 9.7 17 9.7 17.7V20H6.8C6.4 20 6 19.9 5.7 19.6C5.4 19.3 5.2 18.9 5.2 18.5V15.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const footerLinks = [
  { label: 'About', to: '/' },
  { label: 'Explore', to: '/search' },
  { label: 'Login', to: '/login', state: { allowPublicAccess: true } },
  { label: 'Register', to: '/register', state: { allowPublicAccess: true } },
];

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com', icon: TwitterIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: LinkedInIcon },
  { label: 'Instagram', href: 'https://instagram.com', icon: InstagramIcon },
  { label: 'GitHub', href: 'https://github.com/kunal1k5/SkillVigo', icon: GitHubIcon },
];

export default function Footer() {
  return (
    <footer className="pb-7 pt-8">
      <PageContainer>
        <div
          className="relative overflow-hidden rounded-[32px] border border-sky-300/15 bg-slate-950 px-5 py-6 text-slate-50 shadow-[0_28px_70px_rgba(15,23,42,0.18)] sm:px-7 sm:py-7"
        >
          <div className="absolute -left-[8%] -top-[30%] h-60 w-60 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="absolute -bottom-[30%] -right-[4%] h-64 w-64 rounded-full bg-teal-500/15 blur-2xl" />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)] lg:items-start">
            <div className="space-y-4">
              <Badge
                tone="dark"
                uppercase
                style={{
                  width: 'fit-content',
                  fontSize: 'clamp(11px, 2.8vw, 14px)',
                  padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3.5vw, 16px)',
                  letterSpacing: '0.12em',
                }}
              >
                Growth-Oriented
              </Badge>

              <h2
                className="max-w-3xl text-[clamp(1.05rem,6vw,2.2rem)] font-semibold leading-[1.12] tracking-tight text-slate-50"
                style={{ fontFamily: 'var(--sv-font-display)' }}
              >
                "Connecting learners and trusted tutors through a seamless, thoughtful experience."
              </h2>

              <p className="max-w-2xl text-[clamp(0.95rem,3.6vw,1.2rem)] leading-[1.75] text-slate-300/90">
                SkillVigo now has stronger layout and common components so every screen feels more polished, premium, and consistent by default.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-50">
                  <BoxIcon className="h-4 w-4 text-sky-300" />
                  <strong className="text-[11px] uppercase tracking-[0.14em] sm:text-xs">Product</strong>
                </div>

                <div className="mt-3 grid gap-2">
                  {footerLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      state={link.state}
                      className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white sm:text-[15px]"
                    >
                      <ArrowIcon className="h-3.5 w-3.5 text-slate-400" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-50">
                  <ShareIcon className="h-4 w-4 text-teal-300" />
                  <strong className="text-[11px] uppercase tracking-[0.14em] sm:text-xs">Social</strong>
                </div>

                <div className="mt-3 grid gap-2">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white sm:text-[15px]"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-white/15 via-white/10 to-white/0 lg:col-span-2" />

            <div className="flex flex-wrap items-center justify-between gap-3 text-slate-300/70 lg:col-span-2">
              <small className="text-xs sm:text-sm">
                Copyright {new Date().getFullYear()} SkillVigo. All rights reserved.
              </small>
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
