export default function ThemeStyles() {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');

        :root {
          --sv-font-body: "Manrope", "Segoe UI", sans-serif;
          --sv-font-display: "Sora", "Aptos", sans-serif;
          --sv-bg: #C7EABB;
          --sv-surface: rgba(255, 255, 255, 0.84);
          --sv-surface-strong: rgba(255, 255, 255, 0.94);
          --sv-surface-soft: rgba(248, 250, 252, 0.92);
          --sv-text: #0f172a;
          --sv-text-muted: #5b6b82;
          --sv-text-soft: #7b8aa2;
          --sv-border: rgba(148, 163, 184, 0.2);
          --sv-border-strong: rgba(15, 23, 42, 0.12);
          --sv-primary: #1d4ed8;
          --sv-accent: #0f766e;
          --sv-brand: linear-gradient(135deg, #020617 0%, #1d4ed8 48%, #0f766e 100%);
          --sv-brand-soft: linear-gradient(135deg, rgba(2, 6, 23, 0.95) 0%, rgba(29, 78, 216, 0.92) 48%, rgba(15, 118, 110, 0.9) 100%);
          --sv-shadow-soft: 0 18px 40px rgba(15, 23, 42, 0.08);
          --sv-shadow-lg: 0 28px 70px rgba(15, 23, 42, 0.12);
          --sv-radius-card: 28px;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          min-height: 100%;
        }

        body {
          margin: 0;
          font-family: var(--sv-font-body);
          color: var(--sv-text);
          background: var(--sv-bg);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        a {
          color: inherit;
        }

        .sv-navbar-shell {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          transform-origin: center top;
        }

        .sv-navbar-shell:hover {
          transform: translateY(-2px);
          border-color: rgba(95, 127, 84, 0.42);
          box-shadow:
            0 20px 42px rgba(84, 117, 71, 0.14),
            0 0 0 1px rgba(132, 177, 121, 0.16),
            0 0 28px rgba(132, 177, 121, 0.2);
        }

        .sv-navbar-brand {
          transition: transform 0.18s ease;
        }

        .sv-navbar-brand:hover {
          transform: translateY(-1px);
        }

        .sv-navbar-brand-dot {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .sv-navbar-brand:hover .sv-navbar-brand-dot {
          transform: scale(1.1);
          box-shadow:
            0 0 0 8px rgba(132, 177, 121, 0.14),
            0 0 18px rgba(95, 127, 84, 0.18);
        }

        .sv-navbar-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          color: #5b6b82;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          padding: 8px 10px;
          white-space: nowrap;
          transition: color 0.18s ease, transform 0.18s ease, text-shadow 0.18s ease;
        }

        .sv-navbar-link:hover {
          color: #0f172a;
          transform: translateY(-1px);
          text-shadow: 0 0 14px rgba(95, 127, 84, 0.16);
        }

        .sv-navbar-link::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: -2px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, #5f7f54 0%, #84B179 100%);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.18s ease;
        }

        .sv-navbar-link:hover::after,
        .sv-navbar-link-active::after {
          transform: scaleX(1);
        }

        .sv-navbar-link-active {
          color: #0f172a;
          font-weight: 800;
        }

        .sv-navbar-text-link {
          transition: color 0.18s ease, transform 0.18s ease, text-shadow 0.18s ease;
        }

        .sv-navbar-text-link:hover {
          color: #0f172a !important;
          transform: translateY(-1px);
          text-shadow: 0 0 12px rgba(95, 127, 84, 0.14);
        }

        .sv-navbar-pill-link {
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .sv-navbar-pill-link:hover {
          transform: translateY(-1px);
          box-shadow:
            0 16px 30px rgba(84, 117, 71, 0.16),
            0 0 24px rgba(95, 127, 84, 0.18);
          filter: saturate(1.04);
        }

        .sv-footer-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 10px 14px;
          border-radius: 999px;
          text-decoration: none;
          color: #365133;
          isolation: isolate;
          transition:
            color 0.18s ease,
            transform 0.18s ease,
            text-shadow 0.18s ease,
            box-shadow 0.22s ease;
        }

        .sv-footer-link::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: rgba(255, 255, 255, 0.26);
          opacity: 0;
          transform: scale(0.9);
          transition:
            opacity 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.22s ease;
          z-index: -2;
        }

        .sv-footer-link::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: rgba(132, 177, 121, 0.22);
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          transition:
            transform 0.24s ease,
            opacity 0.24s ease;
          z-index: -1;
          pointer-events: none;
        }

        .sv-footer-link:hover,
        .sv-footer-link:focus-visible {
          color: #1e3520;
          transform: translateY(-1px);
          text-shadow: 0 0 10px rgba(95, 127, 84, 0.14);
        }

        .sv-footer-link:hover::before,
        .sv-footer-link:focus-visible::before {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 0 20px rgba(132, 177, 121, 0.14);
        }

        .sv-footer-link:active::after {
          opacity: 1;
          transform: translate(-50%, -50%) scale(9);
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        ::selection {
          background: rgba(37, 99, 235, 0.18);
          color: #0f172a;
        }
      `}
    </style>
  );
}
