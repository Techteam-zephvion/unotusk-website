'use client'

export function Footer() {
  const mono = { fontFamily: 'var(--font-inter), sans-serif' } as React.CSSProperties

  const responsiveFontSize = 'clamp(10px, 0.85vw, 12px)'

  const linkStyle: React.CSSProperties = {
    ...mono,
    fontSize: responsiveFontSize,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'rgba(203,193,181,0.60)',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  }

  return (
    <footer style={{ background: '#0B1020', paddingTop: '8vh' }}>
      {/* Thin divider */}
      <div style={{ margin: '0 7vw', height: '0.5px', background: 'rgba(203,193,181,0.06)' }} />

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
          src="/logo.png"
          alt="UNOTUSK"
          style={{ height: 'clamp(24px, 2.5vw, 36px)', width: 'auto', opacity: 0.35, filter: 'brightness(10)' }}
        />

        {/* Footer links — far right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          <span style={{ ...mono, fontSize: responsiveFontSize, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(203,193,181,0.50)' }}>
            Zephvion Pvt. Ltd.
          </span>
          <span style={{ ...mono, fontSize: responsiveFontSize, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(203,193,181,0.50)' }}>
            Built in Bengaluru
          </span>
          <a
            href="mailto:hello@unotusk.com"
            style={linkStyle}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#CBC1B5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(203,193,181,0.60)' }}
          >
            hello@unotusk.com
          </a>

        </div>
      </div>
    </footer>
  )
}
