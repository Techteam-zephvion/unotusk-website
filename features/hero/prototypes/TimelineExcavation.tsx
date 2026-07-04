'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const LAYERS = [
  {
    era: 'This week',
    items: ['checkout.ts', 'PR-482', 'Sprint 44', 'feature flag'],
    depth: 0,
  },
  {
    era: 'Last month',
    items: ['payment retry', 'Stripe webhook', 'auth-flow.ts', 'PR-318'],
    depth: 1,
  },
  {
    era: 'March 2024',
    items: ['March Incident', 'Rejected', 'Rollback v2.2', 'Postmortem'],
    depth: 2,
  },
  {
    era: 'Q4 2023',
    items: ['ADR-014', 'deprecated', 'RFC-009', 'commit a9f83d'],
    depth: 3,
  },
  {
    era: 'Origin decision',
    items: ['Payment retry logic was previously rejected.'],
    depth: 4,
    isRecovered: true,
  },
]

const DEPTH_BLUR = [3.5, 2.5, 1.5, 0.6, 0]
const DEPTH_OPACITY = [0.06, 0.09, 0.13, 0.22, 1]

export function TimelineExcavation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const scanlineRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const ctx = gsap.context(() => {
      const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[]

      // Initial: all layers at max blur/min opacity
      layers.forEach((el, i) => {
        gsap.set(el, {
          opacity: DEPTH_OPACITY[i] * 0.4,
          filter: `blur(${DEPTH_BLUR[i] + 1}px)`,
        })
      })
      gsap.set(scanlineRef.current, { opacity: 0, y: '-100%' })
      gsap.set(cardRef.current, { opacity: 0 })
      gsap.set(headlineRef.current, { opacity: 0, y: 14 })
      gsap.set(ctaRef.current, { opacity: 0 })

      if (prefersReducedMotion) {
        layers.forEach((el, i) => gsap.set(el, { opacity: DEPTH_OPACITY[i], filter: `blur(${DEPTH_BLUR[i]}px)` }))
        gsap.set(cardRef.current, { opacity: 1 })
        gsap.set(headlineRef.current, { opacity: 1, y: 0 })
        gsap.set(ctaRef.current, { opacity: 1 })
        return
      }

      const tl = gsap.timeline()

      // Phase 1: All layers materialise at resting depth
      tl.to(layers, {
        opacity: (i) => DEPTH_OPACITY[i] * 0.6,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power1.inOut',
      })

      // Phase 2: Scanline sweeps top→bottom, revealing each layer
      tl.to(scanlineRef.current, {
        opacity: 0.6,
        duration: 0.2,
        ease: 'power1.out',
      }, '+=0.3')

      // Scanline moves from top to bottom, each layer it passes becomes clearer
      tl.to(scanlineRef.current, {
        y: '110%',
        duration: 2,
        ease: 'none',
        onUpdate() {
          const progress = this.progress()
          layers.forEach((el, i) => {
            // Layer becomes clear when scanline passes it
            const layerThreshold = (i + 0.5) / layers.length
            const revealed = Math.max(0, Math.min(1, (progress - (layerThreshold - 0.12)) / 0.18))
            const targetOpacity = DEPTH_OPACITY[i] * (0.6 + revealed * 0.4)
            const targetBlur = DEPTH_BLUR[i] * (1 - revealed * 0.7)
            gsap.set(el, { opacity: targetOpacity, filter: `blur(${targetBlur}px)` })
          })
        },
      }, '+=0.1')

      tl.to(scanlineRef.current, { opacity: 0, duration: 0.3 }, '-=0.3')

      // Phase 3: Origin decision layer resolves completely
      tl.to(layers[4], {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.2')

      // Phase 4: Card emerges from the deepest layer
      tl.fromTo(cardRef.current,
        { opacity: 0, scale: 0.96, filter: 'blur(4px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' },
        '+=0.2'
      )

      // Phase 5: Headline
      tl.to(headlineRef.current, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      }, '+=0.2')
      tl.to(ctaRef.current, { opacity: 1, duration: 0.4 }, '+=0.2')
    }, containerRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: '#090D17' }}
    >
      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 z-10" style={{ opacity: 0.036, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '200px' }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 z-10" style={{ background: 'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 30%, rgba(9,13,23,0.8) 100%)' }} aria-hidden="true" />

      {/* Scanline */}
      <div
        ref={scanlineRef}
        className="pointer-events-none absolute left-0 right-0 z-30"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(160,124,74,0.6) 20%, rgba(245,243,239,0.4) 50%, rgba(160,124,74,0.6) 80%, transparent 100%)',
          top: 0,
        }}
        aria-hidden="true"
      />

      {/* ── Timeline layers (top = recent, bottom = origin) ── */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-0 select-none" aria-hidden="true">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.era}
            ref={(el) => { layerRefs.current[i] = el }}
            className="flex items-center gap-8 px-12 py-4"
            style={{
              borderBottom: i < LAYERS.length - 1 ? '1px solid rgba(255,255,255,0.025)' : 'none',
            }}
          >
            {/* Era label */}
            <span className="w-24 shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-[#A07C4A]/70">
              {layer.era}
            </span>
            {/* Fragments */}
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {layer.items.map((item) => (
                <span
                  key={item}
                  className="font-mono uppercase"
                  style={{
                    fontSize: layer.isRecovered ? 14 : 10,
                    letterSpacing: '0.14em',
                    color: layer.isRecovered ? '#F5F3EF' : 'rgba(245,243,239,0.7)',
                    fontWeight: layer.isRecovered ? 500 : 400,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Recovered card (emerges from deepest layer) ── */}
      <div ref={cardRef} className="relative z-20 mt-8 w-full max-w-[380px]" style={{ opacity: 0 }}>
        <article
          className="w-full overflow-hidden rounded-2xl"
          style={{ background: 'rgba(17,24,39,0.92)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
        >
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#A07C4A]">recovered context</span>
            <span className="flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] rounded-full bg-[#A07C4A]/60" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#CBC1B5]/40">live</span>
            </span>
          </div>
          <div className="px-6 pt-6 pb-4">
            <p className="text-[15px] font-medium leading-[1.55] text-[#F5F3EF]">
              Payment retry logic was previously rejected.
            </p>
            <p className="mt-3 font-mono text-[12px] text-[#CBC1B5]/60">March incident.</p>
          </div>
          <div className="flex flex-wrap gap-2 px-6 pb-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {['Q4 2023', 'PR-482', 'March Incident'].map(tag => (
              <span key={tag} className="rounded-md border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#CBC1B5]/50" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>{tag}</span>
            ))}
          </div>
        </article>
      </div>

      {/* ── Headline + CTA ── */}
      <div ref={headlineRef} className="relative z-20 mt-12 text-center px-6" style={{ opacity: 0 }}>
        <h1>
          <span className="block text-[clamp(1.75rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.025em] text-[#F5F3EF]" style={{ fontFamily: 'var(--font-young-serif), Georgia, serif' }}>
            AI ships the wrong things.
          </span>
          <span className="block text-[clamp(1.4rem,2.5vw,2rem)] font-light leading-[1.15] tracking-[-0.02em] text-[#CBC1B5]">
            Unotusk rebuilds the memory it needs.
          </span>
        </h1>
        <div ref={ctaRef} className="mt-8" style={{ opacity: 0 }}>
          <a href="#early-access" className="group inline-flex items-center gap-2 border-b border-[#F5F3EF]/15 pb-px font-mono text-[11px] uppercase tracking-[0.14em] text-[#F5F3EF]/60 transition-colors duration-300 hover:border-[#F5F3EF]/30 hover:text-[#F5F3EF]">
            <span>Request Early Access</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}
