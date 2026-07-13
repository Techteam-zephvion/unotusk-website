'use client'

export function Footer() {
  const mono = { fontFamily: 'var(--font-inter), sans-serif' } as React.CSSProperties

  const responsiveFontSize = 'clamp(10px, 0.85vw, 12px)'

  return (
    <footer style={{ background: 'var(--color-bg)', paddingTop: '2.4rem' }}>
      {/* Thin divider */}
      <div style={{ margin: '0 7vw', height: '0.5px', background: 'var(--color-border)' }} />

      <div
        className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4"
        style={{
          padding: '1.2rem 7vw 2.8rem',
        }}
      >
        {/* Logo mark */}
        <img
          src="/logo.svg"
          alt="Unotusk"
          className="self-start md:self-auto"
          style={{ height: 'clamp(36px, 3.5vw, 52px)', width: 'auto', opacity: 0.85 }}
        />

        {/* Footer links — far right on desktop */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-10 w-full sm:w-auto">
          <div className="flex items-center justify-between w-full gap-6 sm:w-auto sm:gap-10">
            <a
              href="https://www.zephvion.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 transition-colors duration-300 hover:text-primary font-mono tracking-[0.12em] uppercase"
              style={{ ...mono, fontSize: responsiveFontSize }}
            >
              WWW.ZEPHVION.COM
            </a>
            <span style={{ ...mono, fontSize: responsiveFontSize, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
              Built in Bengaluru
            </span>
          </div>
          <a
            href="mailto:hello@unotusk.com"
            className="text-primary/60 transition-colors duration-300 hover:text-primary font-mono tracking-[0.12em] uppercase"
            style={{ ...mono, fontSize: responsiveFontSize }}
          >
            hello@unotusk.com
          </a>

        </div>
      </div>
    </footer>
  )
}
