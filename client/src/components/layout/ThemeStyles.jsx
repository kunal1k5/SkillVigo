export default function ThemeStyles() {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');

        :root {
          --sv-font-body: "Manrope", "Segoe UI", sans-serif;
          --sv-font-display: "Sora", "Aptos", sans-serif;
          --sv-bg:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 24%),
            radial-gradient(circle at top right, rgba(15, 118, 110, 0.08), transparent 22%),
            linear-gradient(180deg, #f7fafc 0%, #eef4ff 100%);
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
