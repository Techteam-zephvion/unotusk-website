'use client'

export function Footer() {
  const mono = { fontFamily: 'var(--font-inter), sans-serif' } as React.CSSProperties

  const responsiveFontSize = 'clamp(10px, 0.85vw, 12px)'

  return (
    <footer style={{ background: 'var(--color-bg)', paddingTop: '8vh' }}>
      {/* Thin divider */}
      <div style={{ margin: '0 7vw', height: '0.5px', background: 'var(--color-border)' }} />

      {/* Single horizontal row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2.5rem 7vw 2.8rem',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Logo mark */}
        <img
          src="/logo.svg"
          alt="Unotusk"
          style={{ height: 'clamp(36px, 3.5vw, 52px)', width: 'auto', opacity: 0.85 }}
        />

        {/* Footer links — far right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          <span style={{ ...mono, fontSize: responsiveFontSize, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
            www.zephvion.com
          </span>
          <span style={{ ...mono, fontSize: responsiveFontSize, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
            Built in Bengaluru
          </span>
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
