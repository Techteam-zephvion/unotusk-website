'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface CTAProps {
  onOpenModal: () => void
}

export function CTA({ onOpenModal }: CTAProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const headRef      = useRef<HTMLDivElement>(null)
  const bodyRef      = useRef<HTMLDivElement>(null)
  const promiseRef   = useRef<HTMLDivElement>(null)
  const btnRef       = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const V = 'inset(0 0% 0 0)'
    const H = 'inset(0 100% 0 0)'

    const ctx = gsap.context(() => {
      gsap.set(headRef.current, { clipPath: H })
      gsap.set([bodyRef.current, promiseRef.current, btnRef.current], { opacity: 0 })

      if (reduced) {
        gsap.set(headRef.current, { clipPath: V })
        gsap.set([bodyRef.current, promiseRef.current, btnRef.current], { opacity: 1 })
        return
      }

      // Pin + slow reveal. Dwell holds the invitation so it can be read, not chased.
      // Pin distance scales down on tablet/mobile; desktop keeps the tuned pacing.
      const pinFactor = () =>
        window.innerWidth < 640 ? 0.45 : window.innerWidth < 1024 ? 0.78 : 1
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 1,
          start: 'top top',
          end: () => '+=' + 500 * pinFactor(),
          scrub: 1.2,
        },
      })
        .fromTo(headRef.current,    { clipPath: H }, { clipPath: V, ease: 'none', duration: 0.8 }, 0.1)
        .fromTo(bodyRef.current,    { opacity: 0 },  { opacity: 1, ease: 'none', duration: 0.5 }, 0.9)
        .fromTo(promiseRef.current, { opacity: 0 },  { opacity: 1, ease: 'none', duration: 0.4 }, 1.4)
        .fromTo(btnRef.current,     { opacity: 0 },  { opacity: 1, ease: 'none', duration: 0.4 }, 1.8)
        .to({}, { duration: 0.5 }, 2.2)

    }, containerRef)

    return () => ctx.revert()
  }, [])

  const serif = { fontFamily: "var(--font-young-serif), 'Young Serif', Georgia, serif" } as React.CSSProperties
  const mono  = { fontFamily: 'var(--font-inter), sans-serif' } as React.CSSProperties
  const H = 'inset(0 100% 0 0)'

  return (
    <div
      ref={containerRef}
      id="early-access"
      className="flex min-h-screen flex-col justify-center"
      style={{ padding: '0 7vw', background: '#0B1020', color: '#CBC1B5' }}
    >
      <div style={{ maxWidth: '38rem' }}>

        <div
          ref={headRef}
          style={{
            ...serif,
            clipPath: H,
            fontSize: 'clamp(1.8rem, 3.2vw, 3.2rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            color: '#CBC1B5',
            marginBottom: '2.8rem',
          }}
        >
          Join the first five<br />lighthouse teams.
        </div>

        <div
          ref={bodyRef}
          style={{
            opacity: 0,
            ...mono,
            fontSize: 'clamp(0.875rem, 1.35vw, 0.95rem)',
            lineHeight: 1.80,
            color: '#CBC1B5',
            letterSpacing: '0.005em',
            marginBottom: '1.1rem',
          }}
        >
          We&rsquo;re working with a small number of product
          and engineering teams.
        </div>

        <div
          ref={promiseRef}
          style={{
            opacity: 0,
            ...mono,
            fontSize: 'clamp(0.875rem, 1.35vw, 0.95rem)',
            lineHeight: 1.80,
            color: '#CBC1B5',
            letterSpacing: '0.005em',
            marginBottom: '3.8rem',
          }}
        >
          Every request is reviewed personally.
        </div>

        <div ref={btnRef} style={{ opacity: 0 }}>
          <button
            onClick={onOpenModal}
            style={{
              ...mono,
              fontSize: '0.70rem',
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: '#A07C4A',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: '44px',
              paddingBottom: '0.35rem',
              background: 'transparent',
              borderTop: 0,
              borderLeft: 0,
              borderRight: 0,
              borderBottom: '1px solid rgba(160,124,74,0.30)',
              outline: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.3s, opacity 0.3s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(160,124,74,0.70)'
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.80'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(160,124,74,0.30)'
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
            }}
          >
            Request Early Access →
          </button>
        </div>

      </div>
    </div>
  )
}
