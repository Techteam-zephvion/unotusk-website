'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
  const s1Num = useRef<HTMLDivElement>(null)
  const s2Num = useRef<HTMLDivElement>(null)
  const s1Desc = useRef<HTMLDivElement>(null)
  const s2Desc = useRef<HTMLDivElement>(null)
  const s1Src = useRef<HTMLDivElement>(null)
  const s2Src = useRef<HTMLDivElement>(null)

  // Chapter 3 — Punch
  const punchRef = useRef<HTMLDivElement>(null)
  const pL1 = useRef<HTMLDivElement>(null)
  const pL2 = useRef<HTMLDivElement>(null)
  const pL3 = useRef<HTMLDivElement>(null)

  // Chapter 4 — Bridge
  const bridgeRef = useRef<HTMLDivElement>(null)
  const bridgeT = useRef<HTMLDivElement>(null)
  const bridgeMask = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const V = 'inset(0 0% 0 0)'
    const H = 'inset(0 100% 0 0)'
    const HC = 'inset(0 50% 0 50%)'

    // Scale pinned-scroll distance to the device. Desktop keeps the exact tuned
    // pacing (×1); tablet and mobile get proportionally shorter pins so touch
    // users aren't dragging through thousands of extra pixels. Re-evaluated on
    // every ScrollTrigger refresh (including resize/orientation change).
    const pinFactor = () =>
      window.innerWidth < 640 ? 0.45 : window.innerWidth < 1024 ? 0.78 : 1

    const ctx = gsap.context(() => {

      // ── Initial states ───────────────────────────────────────────
      gsap.set([mask1Ref.current, mask2Ref.current, bridgeMask.current], { xPercent: 0 })
      gsap.set(s1Num.current, { clipPath: HC })
      gsap.set(s2Num.current, { clipPath: HC })
      gsap.set([s1Desc.current, s1Src.current, s2Desc.current, s2Src.current], { opacity: 0 })
      gsap.set([pL1.current, pL2.current, pL3.current], { clipPath: H })

      if (reduced) {
        gsap.set([mask1Ref.current, mask2Ref.current, bridgeMask.current], { xPercent: 110 })
        gsap.set([pL1.current, pL2.current, pL3.current], { clipPath: V })
        gsap.set(s1Num.current, { clipPath: V })
        gsap.set([s1Desc.current], { opacity: 1 })
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
      gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 6,
          start: 'top top',
          end: () => '+=' + 600 * pinFactor(),
          scrub: 1.2,
        },
      })
        .fromTo(mask1Ref.current, { xPercent: 0 }, { xPercent: 110, ease: 'power2.out', duration: 0.8 }, 0.2)
        .to({}, { duration: 0.3 }, 1.0)
        .fromTo(mask2Ref.current, { xPercent: 0 }, { xPercent: 110, ease: 'power2.out', duration: 0.8 }, 1.3)
        .to({}, { duration: 0.8 }, 2.1)
        .fromTo([tL1.current, tL2.current], { opacity: 1 }, { opacity: 0.15, ease: 'power1.in', duration: 0.6 }, 2.9)

      // ── Chapter 2 — Statistics ───────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: statsRef.current,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 5,
          start: 'top top',
          end: () => '+=' + 1000 * pinFactor(),
          scrub: 1.2,
        },
      })
        .fromTo(s1Num.current, { clipPath: HC }, { clipPath: V, ease: 'power2.out', duration: 0.8 }, 0.4)
        .fromTo(s1Desc.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.5 }, 1.0)
        .fromTo(s1Src.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.4 }, 1.3)
        // Short HOLD: visitor reads 95%
        .fromTo(s1Num.current, { clipPath: V }, { clipPath: HC, ease: 'power3.in', duration: 0.6 }, 2.8)
        .fromTo(s2Num.current, { clipPath: HC }, { clipPath: V, ease: 'power3.out', duration: 0.6 }, 3.1)
        .fromTo(s1Desc.current, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.4 }, 2.8)
        .fromTo(s2Desc.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.4 }, 3.3)
        .fromTo(s1Src.current, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.3 }, 2.8)
        .fromTo(s2Src.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.3 }, 3.3)
        // Short HOLD: visitor reads 0%, then it stays visible and scrolls away naturally
        .to({}, { duration: 1.2 }, 3.7)

      // ── Chapter 3 — Punch ────────────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: punchRef.current,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 4,
          start: 'top top',
          end: () => '+=' + 800 * pinFactor(),
          scrub: 1.2,
        },
      })
        .fromTo(pL1.current, { clipPath: H }, { clipPath: V, duration: 0.8 }, 0.2)
        .fromTo(pL2.current, { clipPath: H }, { clipPath: V, duration: 0.8 }, 0.9)
        .fromTo(pL3.current, { clipPath: H }, { clipPath: V, duration: 0.8 }, 1.6)
        // Short hold, then it ends and scrolls away
        .to({}, { duration: 1.0 }, 2.4)

      // ── Chapter 4 — Bridge ───────────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: bridgeRef.current,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 3,
          start: 'top top',
          end: () => '+=' + 800 * pinFactor(),
          scrub: 1.2,
        },
      })
        .to({}, { duration: 0.3 }, 0.0)
        .fromTo(bridgeMask.current, { xPercent: 0 }, { xPercent: 110, ease: 'power2.out', duration: 0.8 }, 0.3)
        // HOLD: visitor reads the pivot
        .to({}, { duration: 1.2 }, 1.1)
        // Fade out at the end of the pin, and transition directly
        .fromTo(bridgeT.current,
          { opacity: 1, filter: 'blur(0px)' },
          { opacity: 0, filter: 'blur(4px)', ease: 'power2.in', duration: 0.8 },
          2.3)

    }, containerRef)

    return () => ctx.revert()
  }, [])

  const serif: React.CSSProperties = {
    fontFamily: "var(--font-young-serif), 'Young Serif', Georgia, serif",
  }
  const mono: React.CSSProperties = {
    fontFamily: 'var(--font-inter), sans-serif',
  }
  const H = 'inset(0 100% 0 0)'
  const HC = 'inset(0 50% 0 50%)'

  const maskOverlay: React.CSSProperties = {
    position: 'absolute', top: 0, bottom: 0,
    left: '-32px', right: 0,
    background: 'linear-gradient(to right, transparent 0px, #0B1020 32px)',
    pointerEvents: 'none',
  }

  return (
    <div ref={containerRef} style={{ background: '#0B1020', color: '#CBC1B5' }}>

      {/* ── Chapter 1: Problem Statement ────────────────────── */}
      <div
        ref={titleRef}
        className="flex min-h-screen items-center"
        style={{ padding: '0 7vw', background: '#0B1020' }}
      >
        <div>
          <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '0.1em' }}>
            <div
              ref={tL1}
              style={{ ...serif, fontSize: 'clamp(2.4rem, 5.8vw, 6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: '#CBC1B5' }}
            >
              The problem isn&rsquo;t AI capability.
            </div>
            <div ref={mask1Ref} aria-hidden="true" style={maskOverlay} />
          </div>
          <div style={{ position: 'relative', overflow: 'hidden', marginTop: '0.1em', paddingBottom: '0.1em' }}>
            <div
              ref={tL2}
              style={{ ...serif, fontSize: 'clamp(2.4rem, 5.8vw, 6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: 'rgba(203,193,181,0.62)' }}
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
        className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: '#0B1020' }}
        aria-live="polite"
      >
        <div style={{ position: 'relative', width: '100%', height: 'clamp(6rem, 16vw, 15rem)', marginBottom: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={s1Num} aria-label="95 percent" style={{ ...serif, position: 'absolute', clipPath: HC, fontSize: 'clamp(5.5rem, 15vw, 14rem)', lineHeight: 1.05, letterSpacing: '-0.045em', color: '#CBC1B5' }}>
            95%
          </div>
          <div ref={s2Num} aria-label="0 percent" style={{ ...serif, position: 'absolute', clipPath: HC, fontSize: 'clamp(5.5rem, 15vw, 14rem)', lineHeight: 1.05, letterSpacing: '-0.045em', color: '#CBC1B5' }}>
            0%
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: 440, minHeight: '5.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={s1Desc} style={{ position: 'absolute', opacity: 0, fontSize: 'clamp(0.875rem, 1.4vw, 1rem)', lineHeight: 1.7, color: 'rgba(203,193,181,0.62)', letterSpacing: '0.01em', textAlign: 'center' }}>
            of enterprise GenAI pilots produce<br />no measurable business impact.
          </div>
          <div ref={s2Desc} style={{ position: 'absolute', opacity: 0, fontSize: 'clamp(0.875rem, 1.4vw, 1rem)', lineHeight: 1.7, color: 'rgba(203,193,181,0.62)', letterSpacing: '0.01em', textAlign: 'center' }}>
            of engineering leaders are very confident<br />AI-generated code behaves correctly<br />in production.
          </div>
        </div>

        <div style={{ position: 'relative', height: '1.5rem', marginTop: '1.5rem' }}>
          <div ref={s1Src} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', opacity: 0, ...mono, fontSize: 9, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(203,193,181,0.32)', whiteSpace: 'nowrap' }}>
            MIT NANDA
          </div>
          <div ref={s2Src} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', opacity: 0, ...mono, fontSize: 9, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(203,193,181,0.32)', whiteSpace: 'nowrap' }}>
            Stack Overflow
          </div>
        </div>
      </div>

      {/* ── Chapter 3: Punch ────────────────────────────────── */}
      <div
        ref={punchRef}
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: '#0B1020' }}
      >
        <div ref={pL1} style={{ ...serif, clipPath: H, fontSize: 'clamp(2.2rem, 5vw, 5.25rem)', lineHeight: 1.04, letterSpacing: '-0.025em', color: '#CBC1B5' }}>Teams keep paying</div>
        <div ref={pL2} style={{ ...serif, clipPath: H, fontSize: 'clamp(2.2rem, 5vw, 5.25rem)', lineHeight: 1.04, letterSpacing: '-0.025em', color: '#CBC1B5' }}>for lessons</div>
        <div ref={pL3} style={{ ...serif, clipPath: H, fontSize: 'clamp(2.2rem, 5vw, 5.25rem)', lineHeight: 1.04, letterSpacing: '-0.025em', color: 'rgba(203,193,181,0.62)' }}>they already learned.</div>
      </div>

      {/* ── Chapter 4: Bridge ───────────────────────────────── */}
      <div
        ref={bridgeRef}
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: '#0B1020' }}
      >
        <style>{`
          @keyframes sparkleTwinkle {
            0%, 100% {
              transform: scale(0) rotate(0deg);
              opacity: 0;
            }
            50% {
              transform: scale(1) rotate(90deg);
              opacity: 0.95;
            }
          }
          .sparkle-star {
            position: absolute;
            pointer-events: none;
            animation: sparkleTwinkle 2.5s ease-in-out infinite;
          }
          .bridge-flex {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }
          .bridge-logo {
            height: clamp(2.7rem, 5.76vw, 4.5rem);
            font-size: clamp(2.7rem, 5.76vw, 4.5rem);
            width: auto;
            opacity: 1;
            display: inline-block;
          }
          .bridge-text {
            font-size: clamp(1.5rem, 3.2vw, 2.5rem);
            letter-spacing: 0.04em;
            color: #CBC1B5;
            filter: blur(0px);
            font-weight: 300;
            line-height: 1;
            display: inline-block;
          }
          @media (min-width: 480px) {
            .bridge-flex {
              flex-direction: row;
              gap: 1rem;
            }
            .bridge-logo {
              transform: translateY(-0.18em);
            }
            .bridge-text {
              transform: translateY(-0.04em);
            }
          }
        `}</style>

        <div className="relative inline-block px-6 md:px-12 py-6" ref={bridgeT}>
          {/* Sparkles */}
          <svg
            className="sparkle-star top-0 left-6 text-[#A07C4A]"
            style={{ animationDelay: '0.2s' }}
            width="12"
            height="12"
            viewBox="0 0 21 21"
          >
            <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="currentColor" />
          </svg>
          <svg
            className="sparkle-star bottom-2 right-6 text-[#C5A880]"
            style={{ animationDelay: '1.1s' }}
            width="14"
            height="14"
            viewBox="0 0 21 21"
          >
            <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="currentColor" />
          </svg>
          <svg
            className="sparkle-star top-2 right-20 text-[#A07C4A]"
            style={{ animationDelay: '1.9s' }}
            width="10"
            height="10"
            viewBox="0 0 21 21"
          >
            <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="currentColor" />
          </svg>

          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="bridge-flex">
              <img
                src="/logo.svg"
                alt="Unotusk"
                className="bridge-logo"
              />
              <span
                className="bridge-text"
                style={mono}
              >
                changes that.
              </span>
            </div>
            <div ref={bridgeMask} aria-hidden="true" style={maskOverlay} />
          </div>
        </div>
      </div>

    </div>
  )
}
