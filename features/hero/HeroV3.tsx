'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Vocabulary — real project memory language ─────────────────
const VOCAB: string[] = [
  'PR-482', 'PR-103', 'PR-891', 'PR-227', 'PR-560', 'PR-318', 'PR-744',
  'checkout.ts', 'auth-flow.ts', 'webhook.ts', 'retry.ts', 'payments.ts',
  'session.ts', 'cache.ts', 'queue.ts', 'router.ts', 'middleware.ts',
  'Slack', 'Jira', 'Notion', 'Linear', 'GitHub', 'Confluence',
  'Decision', 'Rejected', 'Latency', 'Webhook', 'Risk', 'Owner',
  'Incident', 'Timeout', 'Queue', 'Architecture', 'Migration', 'Bug',
  'Constraint', 'Review', 'Merged', 'Rollback', 'Deprecated', 'Blocked',
  'Escalated', 'Archived', 'Resolved', 'Postponed', 'Abandoned',
  'commit a9f83d', 'commit 3b1f72', 'commit d44c90', 'commit b91034',
  'PLAT-1204', 'PAY-340', 'AUTH-112', 'INFRA-559', 'ENG-2201',
  'RFC-009', 'ADR-014', 'ADR-022', 'Postmortem', 'Retro: Q1',
  'March Incident', 'P0 Alert', 'Outage', 'DB Spike', 'Memory Leak',
  'Deadlock', 'Race Condition', 'Cache Miss', 'Cold Start', 'Rate Limit',
  'Circuit Breaker', 'Backpressure', 'Idempotency', 'Dual Write',
  'Feature Flag', 'Kill Switch', 'Dark Launch', 'Canary: 5%',
  'Sprint 44', 'Tech Debt', 'Security Review', 'Compliance Flag',
  'EC2 Spot', 'Lambda Timeout', 'RDS Failover', 'Redis Eviction',
  '#incidents', '#deploys', '#on-call', '#security', '#backend',
  'migration 019', 'Slow Query Log', 'Read Replica', 'Index Bloat',
  'Stripe', '3DS', 'Dispute', 'Refund Logic', 'Subscription Pause',
  'JWT Expiry', 'CSRF', 'OAuth Flow', 'MFA', 'Token Rotation',
  'breaking change', 'workaround', 'temporary fix', 'needs-review',
  'v2 rollback', 'silent failure', 'orphaned records', 'schema lock',
  'LCP 4.2s', 'CLS 0.18', 'bundle 2.4MB', 'tree shaking',
  'connection pool', 'N+1 query', 'soft delete', 'cursor pagination',
]

// ── Types ─────────────────────────────────────────────────────
interface Frag {
  text: string
  x: number       // % of container
  y: number       // %
  baseOpacity: number
  blur: number    // px
  size: number    // px
  rotate: number  // deg
  isChain: boolean
}

// ── Layout generator — client-side only ─────────────────────
function buildFragments(isMobile: boolean): Frag[] {
  const count = isMobile ? 35 : 88
  const CHAIN = isMobile ? 6 : 11  // fragments that participate in reconstruction
  const pool = [...VOCAB].sort(() => Math.random() - 0.5).slice(0, count)

  return pool.map((text, i) => {
    const isChain = i < CHAIN
    let x: number, y: number, tries = 0

    // bg fragments avoid the center zone (where reconstruction appears)
    do {
      x = 3 + Math.random() * 94
      y = 5 + Math.random() * 90
      tries++
    } while (
      !isChain && x > 22 && x < 78 && y > 28 && y < 72 && tries < 18
    )

    return {
      text, x, y,
      baseOpacity: isChain
        ? 0.14 + Math.random() * 0.08
        : 0.14 + Math.random() * 0.12,
      blur: isChain
        ? 0.0
        : 0.2 + Math.random() * 0.4,
      size: isChain
        ? (isMobile ? 10 : 12) + Math.floor(Math.random() * 2)
        : (isMobile ? 8 : 9) + Math.floor(Math.random() * 2),
      rotate: Math.round((Math.random() - 0.5) * (isChain ? 5 : 12)),
      isChain,
    }
  })
}

// ── Component ─────────────────────────────────────────────────
interface HeroV3Props {
  onOpenModal: () => void
  onAnimationComplete?: () => void
}

export function HeroV3({ onOpenModal, onAnimationComplete }: HeroV3Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const fragRefs = useRef<(HTMLSpanElement | null)[]>([])
  const reconstructRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const [frags, setFrags] = useState<Frag[]>([])
  const [animDone, setAnimDone] = useState(false)

  // Generate layout client-side only (avoids SSR mismatch)
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setFrags(buildFragments(isMobile))
  }, [])

  useEffect(() => {
    if (!frags.length || !sectionRef.current) return

    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const allEls = fragRefs.current.filter(Boolean) as HTMLSpanElement[]
      const chainEls = allEls.filter((_, i) => frags[i]?.isChain)
      const bgEls = allEls.filter((_, i) => !frags[i]?.isChain)

      // Map each element → its base opacity (used in multiple stages)
      const opMap = new WeakMap<HTMLSpanElement, number>()
      allEls.forEach((el, i) => opMap.set(el, frags[i]?.baseOpacity ?? 0.15))

      // ── Initial state ────────────────────────────────────────
      gsap.set(allEls, { opacity: 0 })
      gsap.set(reconstructRef.current, { opacity: 0 })
      gsap.set([line1Ref.current, line2Ref.current], {
        clipPath: 'inset(0 100% 0 0)',
      })
      gsap.set(ctaRef.current, { opacity: 0 })

      // ── Reduced motion shortcut ───────────────────────────────
      if (prefersReduced) {
        allEls.forEach((el) =>
          gsap.set(el, { opacity: (opMap.get(el) ?? 0.06) * 0.65 })
        )
        gsap.set(reconstructRef.current, { opacity: 1 })
        gsap.set([line1Ref.current, line2Ref.current], {
          clipPath: 'inset(0 0% 0 0)',
        })
        gsap.set(ctaRef.current, { opacity: 1 })
        setAnimDone(true)
        onAnimationComplete?.()
        return
      }

      // ── Master timeline ───────────────────────────────────────
      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

      // Scene 1 — Hidden memory (0 → ~0.5s)
      // Background fills with fragments: fast, stagger
      tl.to(bgEls, {
        opacity: (_, el) => opMap.get(el as HTMLSpanElement) ?? 0.15,
        duration: 0.55,
        stagger: { amount: 0.5, from: 'random' },
        ease: 'power1.out',
      })
      // Chain fragments appear slightly later
      tl.to(chainEls, {
        opacity: (_, el) => opMap.get(el as HTMLSpanElement) ?? 0.11,
        duration: 0.4,
        stagger: 0.04,
        ease: 'power1.inOut',
      }, '-=0.45')

      // Scene 2 — Intelligence begins
      tl.to(chainEls, {
        opacity: (_, el) => Math.min(0.42, (opMap.get(el as HTMLSpanElement) ?? 0.11) * 3.2),
        filter: 'blur(0.2px)',
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.out',
      }, '+=0.15')

      // Scene 3 — Reconstruction (converging)
      tl.add(() => {
        if (!sectionRef.current) return
        const box = sectionRef.current.getBoundingClientRect()
        const cx = box.width / 2
        const cy = box.height * 0.40

        chainEls.forEach((el, i) => {
          const r = el.getBoundingClientRect()
          const dx = cx - (r.left + r.width / 2)
          const dy = cy - (r.top + r.height / 2)

          gsap.to(el, {
            x: dx,
            y: dy,
            opacity: 0,
            filter: 'blur(0px)',
            duration: 0.45,
            delay: i * 0.02,
            ease: 'power3.inOut',
          })
        })
      }, '+=0.15')

      tl.to({}, { duration: 0.5 })   // wait for convergence

      // Scene 3b — Reconstruction label resolves
      tl.to(reconstructRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      }, '-=0.15')

      // Scene 4 — Headline reveals through masking
      tl.to(line1Ref.current, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.5,
        ease: 'power2.inOut',
      }, '+=0.15')

      tl.to(line2Ref.current, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.5,
        ease: 'power2.inOut',
      }, '-=0.35')

      // Scene 5 — CTA
      tl.to(ctaRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power1.out',
        onComplete: () => {
          setAnimDone(true)
          onAnimationComplete?.()
        }
      }, '+=0.15')

      // Post-animation — settle
      tl.to(bgEls, {
        opacity: (_, el) => (opMap.get(el as HTMLSpanElement) ?? 0.15) * 0.85,
        duration: 1.2,
        stagger: { amount: 0.8, from: 'random' },
        ease: 'power1.inOut',
      }, '+=0.2')

      // Neuron pulse — one fragment wakes briefly, then rests.
      tl.add(() => {
        const pool = [...bgEls]
        let last = -1
        let alive = true

        function pulse() {
          if (!alive || pool.length === 0) return
          let idx: number
          do { idx = Math.floor(Math.random() * pool.length) } while (idx === last && pool.length > 1)
          last = idx
          const el = pool[idx]
          const base = (opMap.get(el) ?? 0.15) * 0.85

          gsap.to(el, {
            opacity: base + 0.15,
            duration: 0.45,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut',
            onComplete: () => {
              gsap.set(el, { opacity: base })
              if (alive) setTimeout(pulse, 1800 + Math.random() * 2400)
            },
          })
        }

        setTimeout(pulse, 1000)
        return () => { alive = false }
      })
    }, sectionRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frags.length])

  // Scroll-scrub exit: as the Hero scrolls away, fade the whole section out.
  // Fully reversible — scroll back up and the Hero reappears in its final state.
  // Runs independently of the auto-play timeline so neither interferes with the other.
  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            // Start fading when the hero's centre hits the viewport top
            start: 'center top',
            // Complete fade when the hero's bottom leaves the viewport top
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
      aria-label="Hero"
    >
      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          opacity: 0.034,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
        aria-hidden="true"
      />

      {/* Atmospheric warm glow — barely perceptible, centred */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 58% 48% at 50% 44%, rgba(160,124,74,0.042) 0%, transparent 65%)',
            'radial-gradient(ellipse 40% 35% at 50% 44%, rgba(245,243,239,0.010) 0%, transparent 55%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Vignette — edges darken, focus pulls to centre */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse 92% 88% at 50% 50%, transparent 28%, var(--color-vignette) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Fragments ─────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        {frags.map((f, i) => (
          <span
            key={i}
            ref={(el) => { fragRefs.current[i] = el }}
            className={`absolute font-mono uppercase text-primary ${animDone
              ? 'pointer-events-auto cursor-default hover:!opacity-85 hover:![filter:none] hover:text-accent transition-all duration-300 ease-out'
              : ''
              }`}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: `${f.size}px`,
              opacity: 0,
              filter: `blur(${f.blur}px)`,
              transform: f.rotate ? `rotate(${f.rotate}deg)` : undefined,
              letterSpacing: '0.15em',
              lineHeight: 1,
              willChange: 'opacity, transform, filter',
            }}
          >
            {f.text}
          </span>
        ))}
      </div>

      {/* ── Foreground ────────────────────────────────────────── */}
      <div className="relative z-20 flex w-full max-w-4xl flex-col items-center gap-10 px-6 pb-20 pt-28 text-center md:px-10">

        {/* Reconstruction indicator — abstract, universal */}
        <div
          ref={reconstructRef}
          className="flex flex-col items-center gap-3"
          style={{ opacity: 0 }}
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: 'var(--color-accent)', opacity: 0.95 }}
            />
            <span className="font-mono text-[13px] font-medium uppercase tracking-[0.28em] text-accent">
              Project Intelligence Layer
            </span>
          </div>
          <span className="font-mono text-[14px] uppercase tracking-[0.20em] text-primary opacity-90 dark:opacity-75">
            Context Reconstructed
          </span>
        </div>

        {/* Divider — only visible after reconstruction */}
        <div
          className="h-px w-12"
          style={{ background: 'var(--color-border)' }}
        />

        {/* Headline — clip-path mask reveal */}
        <div className="space-y-2 overflow-hidden">
          <span
            ref={line1Ref}
            className="block text-[clamp(1.85rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.026em] text-primary"
            style={{
              fontFamily: 'var(--font-young-serif), Georgia, serif',
              clipPath: 'inset(0 100% 0 0)',
              paddingBottom: '0.15em',
              marginBottom: '-0.15em',
            }}
          >
            AI ships the wrong things.
          </span>
          <span
            ref={line2Ref}
            className="block text-[clamp(1.5rem,3vw,2.5rem)] font-normal dark:font-light leading-[1.12] tracking-[-0.022em] text-primary"
            style={{
              clipPath: 'inset(0 100% 0 0)',
              paddingBottom: '0.15em',
              marginBottom: '-0.15em',
            }}
          >
            Unotusk rebuilds the memory it needs.
          </span>
        </div>

        {/* CTA */}
        <div ref={ctaRef} style={{ opacity: 0 }}>
          <button
            onClick={onOpenModal}
            className="group inline-flex items-center gap-2 border-b pb-px font-mono text-[12px] uppercase tracking-[0.14em] text-accent bg-transparent border-t-0 border-x-0 outline-none cursor-pointer transition-colors duration-300 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary"
            style={{ borderBottomColor: 'var(--color-accent)' }}
          >
            <span>Request Early Access</span>
            <span
              className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
