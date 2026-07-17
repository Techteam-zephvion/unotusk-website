'use client'

export function Footer() {
  const mono = { fontFamily: 'var(--font-inter), sans-serif' } as React.CSSProperties

  const responsiveFontSize = 'clamp(10px, 0.85vw, 12px)'

  return (
    <footer style={{ background: 'var(--color-bg)', paddingTop: '2.4rem' }}>
      {/* Thin divider */}
      <div style={{ margin: '0 7vw', height: '0.5px', background: 'var(--color-border)' }} />

      <div
        className="flex flex-col items-center gap-6 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4"
        style={{
          padding: '1.2rem 7vw 2.8rem',
        }}
      >
        {/* Logo mark */}
        <img
          src="/logo.svg"
          alt="Unotusk"
          className="self-start min-[480px]:self-auto"
          style={{ height: 'clamp(36px, 3.5vw, 52px)', width: 'auto', opacity: 0.85 }}
        />

        {/* Footer links — side-by-side on desktop/tablet, stacked and centered on small mobile */}
        <div className="flex flex-row items-center gap-2 sm:gap-4">
          <a
            href="mailto:hello@unotusk.com"
            className="text-primary/60 transition-colors duration-300 hover:text-primary font-mono tracking-[0.12em] uppercase"
            style={{ ...mono, fontSize: responsiveFontSize, whiteSpace: 'nowrap' }}
          >
            hello@unotusk.com
          </a>
          <span style={{ ...mono, fontSize: responsiveFontSize, color: 'var(--color-text-secondary)', opacity: 0.5 }}>
            &middot;
          </span>
          <span style={{ ...mono, fontSize: responsiveFontSize, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', opacity: 0.8, whiteSpace: 'nowrap' }}>
            Built in Bengaluru
          </span>
        </div>
      </div>
    </footer>
  )
}


