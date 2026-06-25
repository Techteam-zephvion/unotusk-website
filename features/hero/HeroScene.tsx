'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FRAGMENT_POOL, CHAIN_TEMPLATES, CARD_CONTENT } from './fragmentsPool'

// ── Visit memory ──────────────────────────────────────────────
interface VisitData {
  count: number
  chainIndex: number
}

function getVisitData(): VisitData {
  try {
    const raw = localStorage.getItem('unotusk_v')
    const prev: VisitData = raw ? JSON.parse(raw) : { count: 0, chainIndex: 0 }
    const next: VisitData = {
      count: prev.count + 1,
      chainIndex: Math.floor(Math.random() * CHAIN_TEMPLATES.length),
    }
    localStorage.setItem('unotusk_v', JSON.stringify(next))
    return next
  } catch {
    return { count: 1, chainIndex: 0 }
  }
}

// ── Fragment position — generated once per session ─────────────
interface PlacedFragment {
  text: string
  x: number   // %
  y: number   // %
  opacity: number
  blur: number
  size: number
  rotate: number
  isChain: boolean
  chainOrder: number
}

function generateLayout(chainIndex: number): PlacedFragment[] {
  const chain = CHAIN_TEMPLATES[chainIndex]

  // Pick 28 background fragments (not in chain)
  const pool = FRAGMENT_POOL.filter((f) => !chain.includes(f))
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 28)

  const placed: PlacedFragment[] = []

  // Place background fragments — scattered, avoiding center zone
  shuffled.forEach((text, i) => {
    let x: number, y: number
    let attempts = 0
    do {
      x = 3 + Math.random() * 94
      y = 8 + Math.random() * 84
      attempts++
      // Avoid dead center (where the card will appear)
    } while (
      x > 30 && x < 70 && y > 30 && y < 70 && attempts < 20
    )

    placed.push({
      text,
      x,
      y,
      opacity: 0.04 + Math.random() * 0.1,
      blur: 1.5 + Math.random() * 2.5,
      size: 8 + Math.floor(Math.random() * 4),
      rotate: Math.round((Math.random() - 0.5) * 10),
      isChain: false,
      chainOrder: -1,
    })
  })

  // Place chain fragments — scattered but findable
  const chainPositions = [
    { x: 10, y: 20 }, { x: 78, y: 18 }, { x: 15, y: 72 }, { x: 80, y: 70 },
  ]
  chain.forEach((text, i) => {
    const pos = chainPositions[i] ?? { x: 20 + i * 15, y: 40 }
    placed.push({
      text,
      x: pos.x + (Math.random() - 0.5) * 8,
      y: pos.y + (Math.random() - 0.5) * 8,
      opacity: 0.12 + Math.random() * 0.06,
      blur: 1.2 + Math.random() * 1,
      size: 10,
      rotate: Math.round((Math.random() - 0.5) * 6),
      isChain: true,
      chainOrder: i,
    })
  })

  return placed
}

// ── Specification Card ────────────────────────────────────────
function SpecCard({ chainIndex }: { chainIndex: number }) {
  const c = CARD_CONTENT[String(chainIndex)] ?? CARD_CONTENT['0']
  return (
    <article
      className="w-full max-w-[400px] overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(17,24,39,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#A07C4A]">
          recovered context
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[5px] w-[5px] rounded-full bg-[#A07C4A]/60" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#CBC1B5]/40">live</span>
        </span>
      </div>

      <div className="px-6 pt-6 pb-4">
        <p className="text-[15px] font-medium leading-[1.55] tracking-[-0.01em] text-[#F5F3EF]">
          {c.title}
        </p>
        <p className="mt-3 font-mono text-[12px] text-[#CBC1B5]/60">{c.body}</p>
      </div>

      <div
        className="flex flex-wrap gap-2 px-6 pb-5 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        {c.meta.map((tag) => (
          <span
            key={tag}
            className="rounded-md border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#CBC1B5]/50"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

// ── Main Scene ────────────────────────────────────────────────
export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const fragmentsRef = useRef<(HTMLSpanElement | null)[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const memoryBadgeRef = useRef<HTMLDivElement>(null)

  const [visitData] = useState<VisitData>(() => {
    if (typeof window === 'undefined') return { count: 1, chainIndex: 0 }
    return getVisitData()
  })

  const [fragments] = useState<PlacedFragment[]>(() =>
    generateLayout(visitData.chainIndex)
  )

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (!containerRef.current || !cardRef.current || !headlineRef.current) return

    const ctx = gsap.context(() => {
      const allFragEls = fragmentsRef.current.filter(Boolean) as HTMLSpanElement[]
      const chainEls = allFragEls.filter((_, i) => fragments[i]?.isChain)
      const bgEls = allFragEls.filter((_, i) => !fragments[i]?.isChain)

      // Instant state — reduced motion or 3rd+ visit
      if (prefersReducedMotion || visitData.count >= 3) {
        gsap.set(allFragEls, { opacity: (i) => fragments[i]?.opacity ?? 0.08 })
        gsap.set(chainEls, { opacity: 0 })
        gsap.set(cardRef.current, { opacity: 1 })
        gsap.set(headlineRef.current, { opacity: 1, y: 0 })

        if (visitData.count >= 3 && memoryBadgeRef.current) {
          gsap.set(memoryBadgeRef.current, { opacity: 1 })
        }
        return
      }

      // Speed multiplier — visit 2 is 60% faster
      const spd = visitData.count === 2 ? 0.55 : 1

      const tl = gsap.timeline()

      // ── Scene 1: Fragments materialise (0 → 1s × spd) ──────
      // Set initial state
      gsap.set(allFragEls, { opacity: 0, filter: (i) => `blur(${fragments[i]?.blur ?? 2}px)` })
      gsap.set(cardRef.current, { opacity: 0 })
      gsap.set(headlineRef.current, { opacity: 0, y: 16 })

      tl.to(bgEls, {
        opacity: (i) => {
          const fi = fragmentsRef.current.indexOf(bgEls[i])
          return fragments[fi]?.opacity ?? 0.07
        },
        duration: 0.6 * spd,
        stagger: { amount: 0.8 * spd, from: 'random' },
        ease: 'power1.in',
      })

      tl.to(
        chainEls,
        {
          opacity: (i) => {
            const fi = fragmentsRef.current.indexOf(chainEls[i])
            return fragments[fi]?.opacity ?? 0.12
          },
          duration: 0.5 * spd,
          stagger: 0.12 * spd,
          ease: 'power1.inOut',
        },
        `-=${0.3 * spd}`
      )

      // ── Scene 2: Scan — chain fragments react (1s → 2s) ────
      // No visible scanner. Chain elements subtly "wake up" — less blur, slightly brighter.
      tl.to(
        chainEls,
        {
          filter: 'blur(0.3px)',
          opacity: 0.5,
          duration: 0.6 * spd,
          stagger: 0.1 * spd,
          ease: 'power2.out',
        },
        `+=${0.2 * spd}`
      )

      // ── Scene 3: Alignment — chain fragments move to card ──
      // Calculate deltas after the stagger completes
      tl.add(() => {
        if (!cardRef.current) return
        const cardRect = cardRef.current.getBoundingClientRect()
        const cx = cardRect.left + cardRect.width / 2
        const cy = cardRect.top + cardRect.height / 2

        chainEls.forEach((el, i) => {
          const rect = el.getBoundingClientRect()
          const dx = cx - (rect.left + rect.width / 2)
          const dy = cy - (rect.top + rect.height / 2)

          gsap.to(el, {
            x: dx,
            y: dy,
            opacity: 0.8,
            filter: 'blur(0px)',
            duration: 0.7 * spd,
            delay: i * 0.1 * spd,
            ease: 'power3.inOut',
          })
        })
      }, `+=${0.1 * spd}`)

      // Wait for alignment to complete
      tl.to({}, { duration: 0.9 * spd })

      // ── Scene 4: Collapse — chain fades out, card builds in ─
      tl.to(chainEls, {
        opacity: 0,
        scale: 0.6,
        duration: 0.35 * spd,
        stagger: 0.05 * spd,
        ease: 'power2.in',
      })

      tl.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.97, filter: 'blur(4px)' },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.55 * spd,
          ease: 'power2.out',
        },
        `-=${0.15 * spd}`
      )

      // ── Scene 5: Headline reveals ────────────────────────────
      tl.to(
        headlineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.7 * spd,
          ease: 'power2.out',
        },
        `+=${0.2 * spd}`
      )

      // Visit 2: show memory badge
      if (visitData.count === 2 && memoryBadgeRef.current) {
        tl.to(
          memoryBadgeRef.current,
          { opacity: 1, duration: 0.4 * spd, ease: 'power1.out' },
          '<'
        )
      }
    }, containerRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={containerRef} className="relative flex min-h-screen items-center overflow-hidden" style={{ background: '#090D17' }}>

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          opacity: 0.036,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }}
        aria-hidden="true"
      />

      {/* Atmospheric warm glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 60% 55% at 50% 48%, rgba(160,124,74,0.055) 0%, transparent 65%)',
            'radial-gradient(ellipse 90% 40% at 50% 50%, rgba(245,243,239,0.012) 0%, transparent 70%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 35%, rgba(9,13,23,0.75) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Background fragments ────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
        {fragments.map((f, i) => (
          <span
            key={i}
            ref={(el) => { fragmentsRef.current[i] = el }}
            className="absolute font-mono text-[#F5F3EF] uppercase"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: `${f.size}px`,
              opacity: 0,
              filter: `blur(${f.blur}px)`,
              transform: f.rotate ? `rotate(${f.rotate}deg)` : undefined,
              letterSpacing: '0.16em',
              lineHeight: 1,
              willChange: 'opacity, transform, filter',
            }}
          >
            {f.text}
          </span>
        ))}
      </div>

      {/* ── Foreground content ───────────────────────────── */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-20 pt-24 md:px-12 lg:px-16">
        <div className="flex flex-col items-center gap-14">

          {/* Card — starts hidden, fades in at Scene 4 */}
          <div ref={cardRef} style={{ opacity: 0 }}>
            <SpecCard chainIndex={visitData.chainIndex} />
          </div>

          {/* Headline — starts hidden, fades in at Scene 5 */}
          <div ref={headlineRef} className="flex flex-col items-center gap-8" style={{ opacity: 0 }}>
            <h1 className="max-w-2xl space-y-2 text-center">
              <span
                className="block text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.08] tracking-[-0.025em] text-[#F5F3EF]"
                style={{ fontFamily: 'var(--font-young-serif), Georgia, serif' }}
              >
                AI ships the wrong things.
              </span>
              <span className="block text-[clamp(1.6rem,3vw,2.5rem)] font-light leading-[1.12] tracking-[-0.02em] text-[#CBC1B5]">
                UNOTUSK rebuilds the memory it needs.
              </span>
            </h1>

            <a
              href="#early-access"
              className="group inline-flex items-center gap-2 border-b border-[#F5F3EF]/15 pb-px font-mono text-[11px] uppercase tracking-[0.14em] text-[#F5F3EF]/60 transition-colors duration-300 hover:border-[#F5F3EF]/30 hover:text-[#F5F3EF]"
            >
              <span>Request Early Access</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </a>
          </div>

          {/* Memory badge — visit 2+ */}
          {visitData.count >= 2 && (
            <div
              ref={memoryBadgeRef}
              className="flex items-center gap-2"
              style={{ opacity: 0 }}
              aria-live="polite"
            >
              <span className="h-[4px] w-[4px] rounded-full bg-[#A07C4A]/70" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CBC1B5]/40">
                {visitData.count >= 3 ? 'Already reconstructed.' : 'Memory restored.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
