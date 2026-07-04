'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

// ── Constants ─────────────────────────────────────────────────
const SENTENCE_WORDS = ['Payment', 'retry', 'logic', 'was', 'previously', 'rejected.']
const SENTENCE_LINE2 = ['March', 'incident.']

const BG_FRAGMENTS = [
  'PR-482','checkout.ts','Rejected','Slack','commit a9f83d','Owner','Risk',
  'Latency','Stripe','Webhook','Incident','Decision','Jira','deprecated',
  'auth-flow.ts','WONTFIX','v2 rollback','tech-debt','Notion','#incidents',
  'PLAT-1204','RFC-009','ADR-014','Session Hijack','Rate Limit','Deadlock',
  'Cold Start','PR-891','commit 3b1f72','branch: hotfix','Rollback v2.2',
  'Queue overflow','Cache Miss','Schema Lock','EC2 Spot','Postmortem',
  'DB Spike','P0 Alert','Outage','Backpressure','Idempotency','3DS',
  'Sprint 44','LCP 4.2s','Tree Shaking','Read Replica','VACUUM ANALYZE',
  'Feature Flag','Kill Switch','Dark Launch','Retro: Q1','On-call Runbook',
]

const CORRUPT = '▒░█▓▄▀'

// ── Corrupted text hook ────────────────────────────────────────
function useCorruptedText(text: string, progress: number) {
  return text
    .split('')
    .map((char, i) => {
      if (char === ' ') return ' '
      const threshold = i / (text.length * 1.1)
      if (progress >= threshold + 0.08) return char
      if (progress >= threshold) {
        return Math.random() > 0.55 ? char : CORRUPT[i % CORRUPT.length]
      }
      return CORRUPT[i % CORRUPT.length]
    })
    .join('')
}

// ── Scattered fragment ────────────────────────────────────────
interface BgFrag { text: string; x: number; y: number; opacity: number; blur: number; size: number; rotate: number }

function scatter(): BgFrag[] {
  const placed: BgFrag[] = []
  // Place bg fragments avoiding exact center
  BG_FRAGMENTS.forEach((text) => {
    let x: number, y: number, attempts = 0
    do {
      x = 4 + Math.random() * 92
      y = 6 + Math.random() * 88
      attempts++
    } while (x > 28 && x < 72 && y > 35 && y < 65 && attempts < 20)
    placed.push({ text, x, y, opacity: 0.14 + Math.random() * 0.12, blur: 0.4 + Math.random() * 1.2, size: 8 + Math.floor(Math.random() * 4), rotate: Math.round((Math.random() - 0.5) * 10) })
  })
  return placed
}

// ── Main component ────────────────────────────────────────────
export function ReconstructionEngine() {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgFragRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wordRefs2 = useRef<(HTMLSpanElement | null)[]>([])
  const targetWordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const targetWordRefs2 = useRef<(HTMLSpanElement | null)[]>([])
  const headlineRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const assembledRef = useRef<HTMLDivElement>(null)

  const [bgFrags] = useState<BgFrag[]>(() => scatter())
  const [headlineProgress, setHeadlineProgress] = useState(0)
  const [showHeadline, setShowHeadline] = useState(false)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Neuron pulse — random bg fragments briefly activate
  const startNeuronPulse = useCallback((els: (HTMLSpanElement | null)[]) => {
    const live = els.filter(Boolean) as HTMLSpanElement[]
    if (!live.length) return
    let running = true
    function pulse() {
      if (!running) return
      const picked = live[Math.floor(Math.random() * live.length)]
      const orig = parseFloat(picked.style.opacity || '0.18')
      gsap.to(picked, {
        opacity: Math.min(orig + 0.18, 0.38),
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
        onComplete: () => gsap.set(picked, { opacity: orig }),
      })
      setTimeout(pulse, 300 + Math.random() * 500)
    }
    pulse()
    return () => { running = false }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip to final state
      setShowHeadline(true)
      setHeadlineProgress(1)
      gsap.set(bgFragRefs.current.filter(Boolean), { opacity: (i) => bgFrags[i]?.opacity ?? 0.18 })
      gsap.set(assembledRef.current, { opacity: 1 })
      gsap.set(ctaRef.current, { opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      const allWords = [...SENTENCE_WORDS, ...SENTENCE_LINE2]

      // Initial state
      gsap.set(bgFragRefs.current.filter(Boolean), { opacity: 0 })
      gsap.set([...wordRefs.current, ...wordRefs2.current].filter(Boolean), { opacity: 0 })
      gsap.set(assembledRef.current, { opacity: 0 })
      gsap.set(ctaRef.current, { opacity: 0 })

      const tl = gsap.timeline()

      // ── Phase 1: Background materialises (0→0.8s) ────────────
      tl.to(bgFragRefs.current.filter(Boolean), {
        opacity: (i) => bgFrags[i]?.opacity ?? 0.07,
        duration: 0.5,
        stagger: { amount: 0.8, from: 'random' },
        ease: 'power1.in',
        onComplete: () => {
          // Start neuron pulse on background
          startNeuronPulse(bgFragRefs.current)
        },
      })

      // ── Phase 2: Scattered words appear (0.8→1.5s) ──────────
      tl.to([...wordRefs.current, ...wordRefs2.current].filter(Boolean), {
        opacity: 0.18,
        duration: 0.4,
        stagger: 0.07,
        ease: 'power1.inOut',
      }, '-=0.1')

      // ── Phase 3: Words converge to sentence (1.5→2.5s) ──────
      tl.add(() => {
        const allWordEls = [...wordRefs.current, ...wordRefs2.current].filter(Boolean) as HTMLSpanElement[]
        const allTargetEls = [...targetWordRefs.current, ...targetWordRefs2.current].filter(Boolean) as HTMLSpanElement[]

        allWordEls.forEach((el, i) => {
          const target = allTargetEls[i]
          if (!target) return
          const from = el.getBoundingClientRect()
          const to = target.getBoundingClientRect()
          const dx = to.left - from.left
          const dy = to.top - from.top

          gsap.to(el, {
            x: dx, y: dy,
            opacity: 0.9,
            filter: 'blur(0px)',
            fontSize: target.style.fontSize || '',
            duration: 0.8,
            delay: i * 0.06,
            ease: 'power3.inOut',
          })
        })
      }, '+=0.15')

      // Wait for convergence
      tl.to({}, { duration: 1.1 })

      // ── Phase 4: Words fade, assembled sentence appears (2.5→3s)
      tl.to([...wordRefs.current, ...wordRefs2.current].filter(Boolean), {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      })
      tl.to(assembledRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      }, '-=0.15')

      // ── Phase 5: Headline resolves (3→4.5s) ─────────────────
      tl.add(() => {
        setShowHeadline(true)
        let p = 0
        const ticker = gsap.ticker.add(() => {
          p = Math.min(1, p + 0.018)
          setHeadlineProgress(p)
          if (p >= 1) gsap.ticker.remove(ticker)
        })
      }, '+=0.3')

      // CTA
      tl.to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '+=0.6')

    }, containerRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const line1Text = 'AI ships the wrong things.'
  const line2Text = 'Unotusk rebuilds the memory it needs.'
  const corruptedLine1 = useCorruptedText(line1Text, headlineProgress)
  const corruptedLine2 = useCorruptedText(line2Text, Math.max(0, headlineProgress - 0.15))

  const allWords = [...SENTENCE_WORDS, ...SENTENCE_LINE2]

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 z-10" style={{ opacity: 0.036, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '200px' }} aria-hidden="true" />

      {/* Warm glow at center */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(160,124,74,0.05) 0%, transparent 65%)' }} aria-hidden="true" />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10" style={{ background: 'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 30%, var(--color-vignette) 100%)' }} aria-hidden="true" />

      {/* ── Background fragments (non-word) ── */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
        {bgFrags.map((f, i) => (
          <span key={i} ref={(el) => { bgFragRefs.current[i] = el }}
            className="absolute font-mono uppercase text-primary"
            style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: `${f.size}px`, opacity: 0, filter: `blur(${f.blur}px)`, transform: f.rotate ? `rotate(${f.rotate}deg)` : undefined, letterSpacing: '0.15em', lineHeight: 1, willChange: 'opacity' }}
          >{f.text}</span>
        ))}
      </div>

      {/* ── Scattered sentence words (absolutely placed, will converge) ── */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
        {SENTENCE_WORDS.map((word, i) => {
          const pos = [
            { x: 12, y: 25 }, { x: 82, y: 20 }, { x: 8, y: 68 },
            { x: 76, y: 72 }, { x: 20, y: 48 }, { x: 70, y: 45 },
          ][i] ?? { x: 30 + i * 8, y: 30 }
          return (
            <span key={word} ref={(el) => { wordRefs.current[i] = el }}
              className="absolute font-mono text-[10px] uppercase tracking-[0.18em] text-primary"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: 0, willChange: 'transform, opacity' }}
            >{word}</span>
          )
        })}
        {SENTENCE_LINE2.map((word, i) => {
          const pos = [{ x: 55, y: 30 }, { x: 35, y: 75 }][i] ?? { x: 60, y: 60 }
          return (
            <span key={word} ref={(el) => { wordRefs2.current[i] = el }}
              className="absolute font-mono text-[10px] uppercase tracking-[0.18em] text-primary"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: 0, willChange: 'transform, opacity' }}
            >{word}</span>
          )
        })}
      </div>

      {/* ── Hidden target positions for convergence ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ opacity: 0 }} aria-hidden="true">
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            {SENTENCE_WORDS.map((word, i) => (
              <span key={word} ref={(el) => { targetWordRefs.current[i] = el }}
                className="font-mono text-[13px] uppercase tracking-[0.18em] text-primary"
              >{word}</span>
            ))}
          </div>
          <div className="mt-1 flex flex-wrap justify-center gap-x-3">
            {SENTENCE_LINE2.map((word, i) => (
              <span key={word} ref={(el) => { targetWordRefs2.current[i] = el }}
                className="font-mono text-[13px] uppercase tracking-[0.18em] text-primary"
              >{word}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Assembled recovered sentence (replaces converged words) ── */}
      <div ref={assembledRef} className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ opacity: 0 }}>
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent mb-4">
            recovered context
          </p>
          <p className="text-[clamp(1rem,2vw,1.35rem)] font-medium leading-[1.6] tracking-[-0.01em] text-primary">
            Payment retry logic was previously rejected.
            <br />
            <span className="text-primary/80 dark:text-primary/70">March incident.</span>
          </p>
        </div>
      </div>

      {/* ── Foreground: headline + CTA ── */}
      <div className="relative z-20 mx-auto w-full max-w-4xl px-6 pt-24 pb-20 text-center">
        {/* Spacer to push content below the assembled sentence */}
        <div className="h-[45vh]" />

        {showHeadline && (
          <div className="space-y-4">
            <h1>
              <span
                className="block text-[clamp(1.75rem,3.2vw,2.6rem)] leading-[1.1] tracking-[-0.025em] text-primary"
                style={{ fontFamily: 'var(--font-young-serif), Georgia, serif' }}
              >
                {corruptedLine1}
              </span>
              <span className="mt-2 block text-[clamp(1.4rem,2.6vw,2.1rem)] font-normal dark:font-light leading-[1.15] tracking-[-0.02em] text-primary">
                {corruptedLine2}
              </span>
            </h1>
          </div>
        )}

        <div ref={ctaRef} className="mt-10" style={{ opacity: 0 }}>
          <a
            href="#early-access"
            className="group inline-flex items-center gap-2 border-b border-primary/25 dark:border-primary/15 pb-px font-mono text-[11px] uppercase tracking-[0.14em] text-primary/75 dark:text-primary/60 transition-colors duration-300 hover:border-primary/30 hover:text-primary"
          >
            <span>Request Early Access</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}
