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
  const headRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const promiseRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLDivElement>(null)

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
        window.innerWidth < 640 ? 0.22 : window.innerWidth < 1024 ? 0.78 : 1
      // Reveal timeline (scrubs as CTA section enters viewport)
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%', // starts when 30% of the section is visible
          end: 'top top',
          scrub: 0.5,
        },
      })
        .fromTo(headRef.current, { clipPath: H }, { clipPath: V, ease: 'none', duration: 1.0 }, 0)
        .fromTo(bodyRef.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.6 }, 0.3)
        .fromTo(promiseRef.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.5 }, 0.5)
        .fromTo(btnRef.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.5 }, 0.7)

      // Pinned timeline for chapter hold
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 1,
          start: 'top top',
          end: () => '+=' + 300 * pinFactor(),
          scrub: 0.6,
        },
      })
        .to({}, { duration: 1.0 }) // HOLD: visitor reads the invitation before footer

    }, containerRef)

    return () => ctx.revert()
  }, [])

  const serif = { fontFamily: "var(--font-young-serif), 'Young Serif', Georgia, serif" } as React.CSSProperties
  const mono = { fontFamily: 'var(--font-inter), sans-serif' } as React.CSSProperties
  const H = 'inset(0 100% 0 0)'

  return (
    <div
      ref={containerRef}
      id="early-access"
      className="relative flex flex-col overflow-hidden min-h-[75vh] sm:min-h-screen"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Top vertical spacer */}
      <div className="flex-1" />

      {/* Main CTA Content */}
      <div style={{ padding: '0 7vw', maxWidth: '38rem', width: '100%' }}>
        <div
          ref={headRef}
          style={{
            ...serif,
            clipPath: H,
            fontSize: 'clamp(1.8rem, 3.2vw, 3.2rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            color: 'var(--color-text-primary)',
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
            color: 'var(--color-text-primary)',
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
            color: 'var(--color-text-primary)',
            letterSpacing: '0.005em',
            marginBottom: '3.8rem',
          }}
        >
          Every request is reviewed personally.
        </div>

        <div ref={btnRef} style={{ opacity: 0 }}>
          <button
            onClick={onOpenModal}
            className="group inline-flex items-center gap-2 border-b pb-px font-mono text-[13px] uppercase tracking-[0.14em] text-accent bg-transparent border-t-0 border-x-0 outline-none cursor-pointer transition-colors duration-300 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary"
            style={{ borderBottomColor: 'var(--color-accent)' }}
          >
            <span>Request Early Access</span>
            <svg
              className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 h-[13px] w-[13px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom vertical spacer */}
      <div style={{ height: 'clamp(2rem, 6vh, 4rem)' }} />
    </div>
  )
}
