'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface Node {
  id: string
  x: number  // % of container
  y: number
  label: string
  cluster: number  // 0 = background noise, 1 = the chain that activates
}

// Cluster 1 = the chain that reconstructs
const NODES: Node[] = [
  // Chain (cluster 1)
  { id: 'c1', x: 42, y: 32, label: 'checkout.ts',    cluster: 1 },
  { id: 'c2', x: 58, y: 28, label: 'PR-482',         cluster: 1 },
  { id: 'c3', x: 50, y: 48, label: 'Rejected',       cluster: 1 },
  { id: 'c4', x: 38, y: 58, label: 'March Incident', cluster: 1 },
  { id: 'c5', x: 62, y: 54, label: 'Stripe',         cluster: 1 },
  // Background (cluster 0) — scattered, never activate
  { id: 'b1',  x: 8,  y: 18, label: 'Slack',         cluster: 0 },
  { id: 'b2',  x: 88, y: 22, label: 'Jira',          cluster: 0 },
  { id: 'b3',  x: 14, y: 70, label: 'commit a9f83d', cluster: 0 },
  { id: 'b4',  x: 82, y: 72, label: 'Notion',        cluster: 0 },
  { id: 'b5',  x: 22, y: 40, label: 'PR-891',        cluster: 0 },
  { id: 'b6',  x: 76, y: 38, label: 'RFC-009',       cluster: 0 },
  { id: 'b7',  x: 6,  y: 50, label: 'Risk',          cluster: 0 },
  { id: 'b8',  x: 93, y: 50, label: 'Owner',         cluster: 0 },
  { id: 'b9',  x: 30, y: 82, label: 'deprecated',    cluster: 0 },
  { id: 'b10', x: 70, y: 80, label: 'WONTFIX',       cluster: 0 },
  { id: 'b11', x: 18, y: 14, label: 'Latency',       cluster: 0 },
  { id: 'b12', x: 78, y: 10, label: 'Webhook',       cluster: 0 },
  { id: 'b13', x: 50, y: 12, label: 'ADR-014',       cluster: 0 },
  { id: 'b14', x: 50, y: 88, label: 'Outage',        cluster: 0 },
  { id: 'b15', x: 35, y: 24, label: 'tech-debt',     cluster: 0 },
  { id: 'b16', x: 65, y: 68, label: 'Backpressure',  cluster: 0 },
  { id: 'b17', x: 25, y: 62, label: 'P0 Alert',      cluster: 0 },
  { id: 'b18', x: 74, y: 44, label: 'DB Spike',      cluster: 0 },
]

// Edges within the chain
const CHAIN_EDGES = [
  ['c1', 'c2'],
  ['c2', 'c3'],
  ['c3', 'c4'],
  ['c3', 'c5'],
  ['c4', 'c5'],
]

export function MemoryConstellation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const svgRef = useRef<SVGSVGElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!dims.w || !containerRef.current) return

    const ctx = gsap.context(() => {
      const bgNodes = NODES.filter(n => n.cluster === 0)
      const chainNodes = NODES.filter(n => n.cluster === 1)
      const bgEls = bgNodes.map(n => nodeRefs.current[n.id]).filter(Boolean) as HTMLDivElement[]
      const chainEls = chainNodes.map(n => nodeRefs.current[n.id]).filter(Boolean) as HTMLDivElement[]
      const lines = svgRef.current?.querySelectorAll<SVGLineElement>('line[data-edge]') ?? []

      gsap.set([...bgEls, ...chainEls], { opacity: 0, scale: 0.5 })
      gsap.set(lines, { opacity: 0 })
      gsap.set(cardRef.current, { opacity: 0 })
      gsap.set(headlineRef.current, { opacity: 0, y: 12 })
      gsap.set(ctaRef.current, { opacity: 0 })

      if (prefersReducedMotion) {
        gsap.set([...bgEls, ...chainEls], { opacity: 1, scale: 1 })
        gsap.set(lines, { opacity: 0.18 })
        gsap.set(cardRef.current, { opacity: 1 })
        gsap.set(headlineRef.current, { opacity: 1, y: 0 })
        gsap.set(ctaRef.current, { opacity: 1 })
        return
      }

      const tl = gsap.timeline()

      // Phase 1: bg nodes materialise
      tl.to(bgEls, {
        opacity: 0.18,
        scale: 1,
        duration: 0.4,
        stagger: { amount: 0.8, from: 'random' },
        ease: 'power2.out',
      })

      // Phase 2: chain nodes light up
      tl.to(chainEls, {
        opacity: 0.9,
        scale: 1,
        duration: 0.35,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.1')

      // Phase 3: edges draw in
      tl.to(lines, {
        opacity: 0.22,
        duration: 0.3,
        stagger: 0.12,
        ease: 'power1.inOut',
      }, '+=0.2')

      // Phase 4: chain collapses toward center (nodes scale down)
      tl.to(chainEls, {
        opacity: 0,
        scale: 0.3,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.in',
      }, '+=0.5')
      tl.to(lines, { opacity: 0, duration: 0.3 }, '<')

      // Phase 5: card builds in
      tl.fromTo(cardRef.current,
        { opacity: 0, scale: 0.94, filter: 'blur(6px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' },
        '-=0.1'
      )

      // Phase 6: headline
      tl.to(headlineRef.current, {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      }, '+=0.2')
      tl.to(ctaRef.current, {
        opacity: 1, duration: 0.4, ease: 'power1.out',
      }, '+=0.2')
    }, containerRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.w])

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 z-10" style={{ opacity: 0.036, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '200px' }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 z-10" style={{ background: 'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 30%, var(--color-vignette) 100%)' }} aria-hidden="true" />

      {/* ── SVG edges ── */}
      {dims.w > 0 && (
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0"
          width={dims.w}
          height={dims.h}
          aria-hidden="true"
        >
          {CHAIN_EDGES.map(([a, b]) => {
            const na = NODES.find(n => n.id === a)!
            const nb = NODES.find(n => n.id === b)!
            return (
              <line
                key={`${a}-${b}`}
                data-edge="true"
                x1={na.x / 100 * dims.w}
                y1={na.y / 100 * dims.h}
                x2={nb.x / 100 * dims.w}
                y2={nb.y / 100 * dims.h}
                stroke="var(--color-accent)"
                strokeWidth="0.5"
                strokeDasharray="3 5"
              />
            )
          })}
        </svg>
      )}

      {/* ── Constellation nodes ── */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        {NODES.map(node => (
          <div
            key={node.id}
            ref={(el) => { nodeRefs.current[node.id] = el }}
            className="absolute flex items-center gap-1.5"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: 0,
            }}
          >
            <span
              className="block rounded-full flex-shrink-0"
              style={{
                width: node.cluster === 1 ? 4 : 3,
                height: node.cluster === 1 ? 4 : 3,
                background: node.cluster === 1 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
            />
            <span
              className="font-mono uppercase"
              style={{
                fontSize: node.cluster === 1 ? 10 : 9,
                letterSpacing: '0.14em',
                color: node.cluster === 1 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {node.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Card ── */}
      <div ref={cardRef} className="relative z-20 w-full max-w-[380px]" style={{ opacity: 0 }}>
        <article
          className="w-full overflow-hidden rounded-2xl"
          style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', boxShadow: '0 32px 80px var(--color-card-shadow)' }}
        >
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">recovered context</span>
            <span className="flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] rounded-full bg-accent/60" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-primary/40">live</span>
            </span>
          </div>
          <div className="px-6 pt-6 pb-4">
            <p className="text-[15px] font-medium leading-[1.55] tracking-[-0.01em] text-primary">
              Payment retry logic was previously rejected.
            </p>
            <p className="mt-3 font-mono text-[12px] text-primary/60">March incident.</p>
          </div>
          <div className="flex flex-wrap gap-2 px-6 pb-5 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            {['PR-482', 'checkout.ts', 'Stripe'].map(tag => (
              <span key={tag} className="rounded-md border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-primary/50" style={{ borderColor: 'var(--color-border)' }}>{tag}</span>
            ))}
          </div>
        </article>
      </div>

      {/* ── Headline ── */}
      <div ref={headlineRef} className="absolute bottom-24 left-0 right-0 z-20 text-center px-6" style={{ opacity: 0 }}>
        <h1>
          <span className="block text-[clamp(1.75rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.025em] text-primary" style={{ fontFamily: 'var(--font-young-serif), Georgia, serif' }}>
            AI ships the wrong things.
          </span>
          <span className="block text-[clamp(1.4rem,2.5vw,2rem)] font-light leading-[1.15] tracking-[-0.02em] text-primary">
            Unotusk rebuilds the memory it needs.
          </span>
        </h1>
        <div ref={ctaRef} className="mt-8" style={{ opacity: 0 }}>
          <a href="#early-access" className="group inline-flex items-center gap-2 border-b border-primary/15 pb-px font-mono text-[11px] uppercase tracking-[0.14em] text-primary/60 transition-colors duration-300 hover:border-primary/30 hover:text-primary">
            <span>Request Early Access</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}
