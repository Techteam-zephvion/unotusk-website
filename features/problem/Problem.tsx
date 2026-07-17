'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const V = 'inset(0% 0% 0% 0%)'
const H = 'inset(0% 100% 0% 0%)'
const HC = 'inset(0% 50% 0% 50%)'

export function Problem() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Chapter 1 — Title
  const titleRef = useRef<HTMLDivElement>(null)
  const tL1 = useRef<HTMLDivElement>(null)
  const tL2 = useRef<HTMLDivElement>(null)
  const mask1Ref = useRef<HTMLDivElement>(null)
  const mask2Ref = useRef<HTMLDivElement>(null)

  // Chapter 2 — Statistics
  const statsRef = useRef<HTMLDivElement>(null)
  const statsContentRef = useRef<HTMLDivElement>(null)
  const s1Num = useRef<HTMLDivElement>(null)
  const s2Num = useRef<HTMLDivElement>(null)
  const s1Desc = useRef<HTMLDivElement>(null)
  const s2Desc = useRef<HTMLDivElement>(null)
  const s1Src = useRef<HTMLDivElement>(null)
  const s2Src = useRef<HTMLDivElement>(null)

  const isAnimatingRef = useRef(false)
  const currentStateRef = useRef(0) // 0: State 1 (95%), 1: State 2 (0%)

  // Chapter 3 — Punch
  const punchRef = useRef<HTMLDivElement>(null)
  const pL1 = useRef<HTMLDivElement>(null)
  const pL2 = useRef<HTMLDivElement>(null)
  const pL3 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches



    // Scale pinned-scroll distance to the device. Desktop keeps the exact tuned
    // pacing (×1); tablet and mobile get proportionally shorter pins so touch
    // users aren't dragging through thousands of extra pixels. Re-evaluated on
    // every ScrollTrigger refresh (including resize/orientation change).
    const pinFactor = () =>
      window.innerWidth < 640 ? 0.22 : window.innerWidth < 1024 ? 0.78 : 1

    const ctx = gsap.context(() => {

      // ── Initial states ───────────────────────────────────────────
      gsap.set([mask1Ref.current, mask2Ref.current], { xPercent: 0 })
      gsap.set(s1Num.current, { clipPath: V, opacity: 1 })
      gsap.set([s1Desc.current], { opacity: 1 })
      gsap.set([s1Src.current], { opacity: 0.65 })
      gsap.set(s2Num.current, { clipPath: HC, opacity: 0 })
      gsap.set([s2Desc.current, s2Src.current], { opacity: 0 })
      gsap.set([pL1.current, pL2.current, pL3.current], { clipPath: H })

      if (reduced) {
        gsap.set([mask1Ref.current, mask2Ref.current], { xPercent: 110 })
        gsap.set([pL1.current, pL2.current, pL3.current], { clipPath: V })
        gsap.set(s1Num.current, { clipPath: V })
        gsap.set([s1Desc.current], { opacity: 1 })
        gsap.set(statsContentRef.current, { opacity: 1 })
        return
      }

      // ── Chapter 1 — Title ────────────────────────────────────────
      //
      // Text in final position. Gradient mask slides right to uncover.
      // Nothing enters. Everything is discovered.
      //
      //  0.5 – 2.0   L1 uncovered                           (1.5 u)
      //  2.0 – 3.0   Hold — visitor reads L1                (1.0 u)
      //  3.0 – 4.5   L2 uncovered — same language           (1.5 u)
      //  4.5 – 7.0   Reading hold — both lines visible      (2.5 u)
      //  7.0 – 8.5   Gentle exit                            (1.5 u)
      //  8.5 –10.0   Closing silence                        (1.5 u)
      // ─────────────────────────────────────────────────────────────
      // Reveal timeline (scrubs as section enters viewport)
      gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 60%', // starts when 40% of the section is visible
          end: 'top top',
          scrub: 0.5,
        },
      })
        .fromTo(mask1Ref.current, { xPercent: 0 }, { xPercent: 110, ease: 'power2.out', duration: 1.0 }, 0)
        .fromTo(mask2Ref.current, { xPercent: 0 }, { xPercent: 110, ease: 'power2.out', duration: 1.0 }, 0.4)

      // Pinned timeline for chapter exit
      gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 6,
          start: 'top top',
          end: () => '+=' + 120 * pinFactor(),
          scrub: 0.6,
        },
      })
        .to({}, { duration: 0.3 }) // HOLD: visitor reads the revealed text
        .fromTo([tL1.current, tL2.current], { opacity: 1 }, { opacity: 0.15, ease: 'power1.inOut', duration: 0.7 })

      // Reveal when section is 30% visible (non-scrubbed to avoid scroll lock conflicts)
      gsap.fromTo(statsContentRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'power2.out',
          duration: 0.6,
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          }
        }
      )

      // Transition timeline (paused, manually controlled)
      const statsTimeline = gsap.timeline({ paused: true })
        // Fade out State 1 (95%)
        .fromTo(s1Num.current, { clipPath: V, opacity: 1 }, { clipPath: HC, opacity: 0, ease: 'power3.in', duration: 0.3 })
        .fromTo(s1Desc.current, { opacity: 1 }, { opacity: 0, ease: 'power3.in', duration: 0.25 }, '<')
        .fromTo(s1Src.current, { opacity: 0.65 }, { opacity: 0, ease: 'power3.in', duration: 0.2 }, '<')
        // Clean gap
        .to({}, { duration: 0.1 })
        // Fade in State 2 (0%)
        .fromTo(s2Num.current, { clipPath: HC, opacity: 0 }, { clipPath: V, opacity: 1, ease: 'power3.out', duration: 0.3 }, '+=0.1')
        .fromTo(s2Desc.current, { opacity: 0 }, { opacity: 1, ease: 'power3.out', duration: 0.25 }, '<')
        .fromTo(s2Src.current, { opacity: 0 }, { opacity: 0.65, ease: 'power3.out', duration: 0.2 }, '<')

      const transitionTo = (targetState: number, targetScrollY: number) => {
        isAnimatingRef.current = true
        currentStateRef.current = targetState

        // 1. Play timeline in the correct direction
        if (targetState === 1) {
          statsTimeline.play()
        } else {
          statsTimeline.reverse()
        }

        // 2. Smoothly scroll window to target Y
        // @ts-ignore
        if (window.lenis) {
          // @ts-ignore
          window.lenis.scrollTo(targetScrollY, {
            duration: 0.8,
            force: true,
          })
        } else {
          gsap.to(window, {
            scrollTo: targetScrollY,
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }

        // 3. Release lock after scroll transition completes
        setTimeout(() => {
          isAnimatingRef.current = false
        }, 850)
      }

      // Pinned ScrollTrigger for the stats section
      ScrollTrigger.create({
        trigger: statsRef.current,
        pin: true,
        anticipatePin: 1,
        refreshPriority: 5,
        start: () => window.innerWidth < 768 ? 'top 20%' : 'top top',
        end: () => '+=' + 500 * pinFactor(),
        onEnter: () => {
          if (!isAnimatingRef.current) {
            currentStateRef.current = 0
            statsTimeline.progress(0)
          }
        },
        onEnterBack: () => {
          if (!isAnimatingRef.current) {
            currentStateRef.current = 1
            statsTimeline.progress(1)
          }
        },
        onUpdate: (self) => {
          if (isAnimatingRef.current) return

          const progress = self.progress
          const pinDist = 500 * pinFactor()

          if (currentStateRef.current === 0 && self.direction === 1 && progress > 0.22) {
            transitionTo(1, self.start + pinDist)
          } else if (currentStateRef.current === 1 && self.direction === -1 && progress < 0.78) {
            transitionTo(0, self.start)
          }
        }
      })

      // Reveal timeline (scrubs as punch section enters viewport)
      gsap.timeline({
        scrollTrigger: {
          trigger: punchRef.current,
          start: 'top 75%', // starts when 25% of the section is visible
          end: 'top 40%',  // fully revealed earlier while there is still ample space above
          scrub: 0.5,
        },
      })
        .fromTo(pL1.current, { clipPath: H }, { clipPath: V, ease: 'power2.out', duration: 1.0 }, 0)
        .fromTo(pL2.current, { clipPath: H }, { clipPath: V, ease: 'power2.out', duration: 1.0 }, 0.3)
        .fromTo(pL3.current, { clipPath: H }, { clipPath: V, ease: 'power2.out', duration: 1.0 }, 0.6)

      // Pinned timeline for chapter hold
      gsap.timeline({
        scrollTrigger: {
          trigger: punchRef.current,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 4,
          start: 'top top',
          end: () => '+=' + 100 * pinFactor(),
          scrub: 0.6,
        },
      })
        .to({}, { duration: 1.0 }) // HOLD: visitor reads the punch lines before unpinning





    }, containerRef)

    return () => ctx.revert()
  }, [])

  const serif: React.CSSProperties = {
    fontFamily: "var(--font-young-serif), 'Young Serif', Georgia, serif",
  }
  const mono: React.CSSProperties = {
    fontFamily: 'var(--font-inter), sans-serif',
  }
  const H = 'inset(0% 100% 0% 0%)'
  const HC = 'inset(0% 50% 0% 50%)'

  const maskOverlay: React.CSSProperties = {
    position: 'absolute', top: 0, bottom: 0,
    left: '-32px', right: 0,
    background: 'linear-gradient(to right, transparent 0px, var(--color-bg) 32px)',
    pointerEvents: 'none',
  }

  return (
    <div ref={containerRef} style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>

      {/* ── Chapter 1: Problem Statement ────────────────────── */}
      <div
        ref={titleRef}
        className="flex min-h-[45vh] sm:min-h-[65vh] items-center"
        style={{ padding: '0 7vw', background: 'var(--color-bg)' }}
      >
        <div>
          <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '0.1em' }}>
            <div
              ref={tL1}
              style={{ ...serif, fontSize: 'clamp(1.8rem, 5.8vw, 6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: 'var(--color-text-primary)' }}
            >
              The problem isn&rsquo;t AI capability.
            </div>
            <div ref={mask1Ref} aria-hidden="true" style={maskOverlay} />
          </div>
          <div style={{ position: 'relative', overflow: 'hidden', marginTop: '0.1em', paddingBottom: '0.1em' }}>
            <div
              ref={tL2}
              style={{ ...serif, fontSize: 'clamp(1.8rem, 5.8vw, 6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: 'var(--color-text-secondary)' }}
            >
              It&rsquo;s AI without project memory.
            </div>
            <div ref={mask2Ref} aria-hidden="true" style={maskOverlay} />
          </div>
        </div>
      </div>

      {/* ── Chapter 2: Statistics ───────────────────────────── */}
      <div
        ref={statsRef}
        className="relative flex min-h-[75vh] sm:min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--color-bg)' }}
        aria-live="polite"
      >
        <div ref={statsContentRef} style={{ opacity: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', height: 'clamp(6rem, 16vw, 15rem)', marginBottom: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div ref={s1Num} aria-label="95 percent" style={{ ...serif, position: 'absolute', clipPath: V, opacity: 1, fontSize: 'clamp(4.5rem, 15vw, 14rem)', lineHeight: 1.05, letterSpacing: '-0.045em', color: 'var(--color-text-primary)' }}>
              95%
            </div>
            <div ref={s2Num} aria-label="0 percent" style={{ ...serif, position: 'absolute', clipPath: HC, opacity: 0, fontSize: 'clamp(4.5rem, 15vw, 14rem)', lineHeight: 1.05, letterSpacing: '-0.045em', color: 'var(--color-text-primary)' }}>
              0%
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: 540, minHeight: '6.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div ref={s1Desc} style={{ position: 'absolute', opacity: 1, fontSize: 'clamp(0.78rem, 4.5vw, 1.35rem)', lineHeight: 1.7, color: 'var(--color-text-secondary)', letterSpacing: '0.01em', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ whiteSpace: 'nowrap' }}>of enterprise GenAI pilots produce</span>
              <span style={{ whiteSpace: 'nowrap' }}>no measurable business impact.</span>
            </div>
            <div ref={s2Desc} style={{ position: 'absolute', opacity: 0, fontSize: 'clamp(0.78rem, 4.5vw, 1.35rem)', lineHeight: 1.7, color: 'var(--color-text-secondary)', letterSpacing: '0.01em', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ whiteSpace: 'nowrap' }}>of engineering leaders are very confident</span>
              <span style={{ whiteSpace: 'nowrap' }}>AI-generated code behaves correctly</span>
              <span style={{ whiteSpace: 'nowrap' }}>in production.</span>
            </div>
          </div>

          <div style={{ position: 'relative', height: '1.5rem', marginTop: '1.5rem' }}>
            <div ref={s1Src} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', opacity: 0.65, ...mono, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              MIT NANDA
            </div>
            <div ref={s2Src} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', opacity: 0, ...mono, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              Stack Overflow
            </div>
          </div>
        </div>
      </div>

      {/* ── Chapter 3: Punch ────────────────────────────────── */}
      <div
        ref={punchRef}
        className="flex min-h-[32vh] sm:min-h-[58vh] flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div ref={pL1} style={{ ...serif, clipPath: H, fontSize: 'clamp(1.3rem, 6.5vw, 5.25rem)', lineHeight: 1.04, letterSpacing: '-0.025em', color: 'var(--color-text-primary)', paddingBottom: '0.15em', marginBottom: '-0.15em', whiteSpace: 'nowrap' }}>Teams keep paying</div>
        <div ref={pL2} style={{ ...serif, clipPath: H, fontSize: 'clamp(1.3rem, 6.5vw, 5.25rem)', lineHeight: 1.04, letterSpacing: '-0.025em', color: 'var(--color-text-primary)', paddingBottom: '0.15em', marginBottom: '-0.15em', whiteSpace: 'nowrap' }}>for lessons</div>
        <div ref={pL3} style={{ ...serif, clipPath: H, fontSize: 'clamp(1.3rem, 6.5vw, 5.25rem)', lineHeight: 1.04, letterSpacing: '-0.025em', color: 'var(--color-text-secondary)', paddingBottom: '0.15em', marginBottom: '-0.15em', whiteSpace: 'nowrap' }}>they already learned.</div>
      </div>



    </div>
  )
}
// Rebuild trigger to clear stale cache: 1720980567
