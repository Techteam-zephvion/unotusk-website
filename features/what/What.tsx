'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const H = 'inset(0 100% 0 0)'
const V = 'inset(0 0% 0 0)'

// The packing mask is rasterized at runtime from the real UNOTUSK favicon
// so the word cloud takes the icon's EXACT silhouette (eye becomes a gap).
const FAVICON_SRC = '/favicon.png'

// Pre-load the favicon image at module scope so it's fully cached and ready by the time the component mounts
let preloadedImage: HTMLImageElement | null = null
if (typeof window !== 'undefined') {
  preloadedImage = new Image()
  preloadedImage.src = FAVICON_SRC
}

// ---------------------------------------------------------------------------
// Word source. tier = size/weight. The list runs head -> trunk; each word's
// index gives its preferred vertical band, so decision vocabulary packs into
// the head and code/infra vocabulary into the body and trunk.
// ---------------------------------------------------------------------------
type Tier = 'xl' | 'l' | 'm' | 's' | 'xs'
const TIER: Record<Tier, { size: number; op: number; weight: number }> = {
  xl: { size: 0.68, op: 0.96, weight: 700 },
  l:  { size: 0.46, op: 0.84, weight: 600 },
  m:  { size: 0.35, op: 0.64, weight: 500 },
  s:  { size: 0.26, op: 0.46, weight: 400 },
  xs: { size: 0.18, op: 0.30, weight: 400 },
}

const SOURCE: [string, Tier][] = [
  // ---- HEAD (decision / product) ----
  ['STRATEGY', 'm'], ['STAKEHOLDER', 's'], ['SUCCESS-CRITERIA', 's'],
  ['DECIDER', 'm'], ['SCOPE', 's'], ['ACCEPTANCE-CRITERIA', 'xs'],
  ['ARCHITECTURE', 'l'], ['CONTEXT', 's'], ['INTENT', 'xs'],
  ['DECISION', 'xl'], ['TRADE-OFF', 's'], ['ANALYSIS', 'xs'], ['RATIONALE', 's'],
  ['REQUIREMENT', 'xl'], ['FEASIBILITY', 's'], ['OBJECTIVE', 'm'],
  ['CONSTRAINT', 'l'], ['ASSUMPTION', 's'], ['DECISION-LOG', 'xs'], ['SCOPE', 'xs'],
  ['SOLUTION', 'l'], ['MEETING', 'xs'], ['CONSTRAINT', 'm'], ['DISCUSSION', 's'],
  ['DESIGN', 'l'], ['COMMENT', 's'], ['REVIEW', 'xs'], ['ALGORITHM', 's'],
  ['ALTERNATIVE', 'xs'], ['ESTIMATION', 's'], ['DEPENDENCY', 's'],
  ['DATA-STRUCTURE', 'xs'], ['VALIDATION', 's'], ['OWNER', 'xs'], ['PROPOSAL', 's'],
  // ---- UPPER BODY (engineering) ----
  ['IMPLEMENTATION', 'xl'], ['COMMIT', 's'], ['LOGIC', 's'], ['PATCH', 'xs'],
  ['COMPONENT', 'm'], ['UTILS', 'xs'], ['REQUEST', 's'],
  ['MERGE', 'm'], ['BRANCH', 'm'], ['PULL-REQUEST', 's'],
  ['CODE-REVIEW', 'm'], ['DIFF', 's'], ['CONFLICT', 'xs'],
  ['FUNCTION()', 'm'], ['CODE', 'xl'], ['CLASS', 's'], ['ASYNC', 'xs'],
  ['TESTING', 'l'], ['UNIT-TEST', 's'], ['INTEGRATION-TEST', 'xs'],
  // ---- LOWER BODY / TRUNK (infra / ops) ----
  ['DEFAULT', 'xs'], ['RETURN', 's'], ['CI/CD', 'l'], ['TEST-CASE', 's'],
  ['PIPELINE', 'm'], ['STATIC-ANALYSIS', 's'], ['SONAR', 'xs'], ['TAG', 'xs'],
  ['BUILD', 'm'], ['CONTAINER-IMAGE', 's'], ['DOCKERFILE', 'xs'],
  ['DEPLOY', 'l'], ['ENVIRONMENT', 's'], ['STAGING', 'xs'],
  ['MONITORING', 'xl'], ['LOGGING', 's'], ['ALERT', 'xs'], ['METRICS', 'm'],
  ['DASHBOARD', 'xs'], ['TRACE', 's'], ['HEALTH-CHECK', 'xs'], ['PERFORMANCE', 's'],
  ['THROUGHPUT', 'xs'], ['LATENCY', 's'], ['ERROR-RATE', 'xs'],
  ['DATABASE', 'xl'], ['SCHEMA', 's'], ['MIGRATION', 'xs'], ['TRANSACTION', 's'],
  ['QUERY', 'xs'], ['INDEX', 's'], ['CACHE', 'l'], ['REDIS', 's'],
  ['SEARCH', 'l'], ['ELASTIC', 'xs'], ['STORAGE', 's'], ['BACKUP', 'xs'],
  ['ONTOLOGY', 's'], ['KNOWLEDGE', 'm'], ['LANGCHAIN', 's'], ['GRAPH', 'xs'],
  ['NODE', 'xs'], ['EDGE', 's'], ['VECTOR', 'xs'], ['EMBEDDING', 's'],
]

// Filler vocabulary (all small) packed last to fill the gaps, like the faint
// micro-text in the reference.
const FILLER = [
  'commit', 'spec', 'ticket', 'sprint', 'epic', 'label', 'hotfix', 'rebase',
  'lint', 'mock', 'stub', 'fixture', 'coverage', 'assert', 'regression',
  'rollback', 'canary', 'feature-flag', 'webhook', 'cron', 'queue', 'worker',
  'token', 'session', 'oauth', 'rate-limit', 'retry', 'timeout', 'idempotent',
  'payload', 'endpoint', 'route', 'handler', 'middleware', 'config', 'secret',
  'env', 'namespace', 'cluster', 'replica', 'shard', 'partition', 'stream',
  'event', 'topic', 'consumer', 'producer', 'snapshot', 'checkpoint', 'lock',
  'mutex', 'thread', 'pool', 'buffer', 'cursor', 'paginate', 'filter', 'sort',
  'join', 'aggregate', 'normalize', 'serialize', 'parse', 'encode', 'hash',
  'diff', 'patch', 'tag', 'release', 'semver', 'changelog', 'artifact',
]

interface Placed {
  text: string; x: number; y: number; fontSize: number; op: number; weight: number
}

export function What() {
  const STAGE_SIZE = 'clamp(480px, 72vh, 600px)'
  const containerRef = useRef<HTMLDivElement>(null)
  const megaRef      = useRef<HTMLDivElement>(null)
  const sqRef        = useRef<HTMLDivElement>(null)
  const vapourRef    = useRef<HTMLDivElement>(null)
  const wordRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const ps1           = useRef<HTMLDivElement>(null)
  const ps2           = useRef<HTMLDivElement>(null)
  const ps3           = useRef<HTMLDivElement>(null)
  const faviconImgRef = useRef<HTMLImageElement>(null)
  const psClose1      = useRef<HTMLDivElement>(null)
  const psClose2      = useRef<HTMLDivElement>(null)

  const [placed, setPlaced] = useState<Placed[]>([])
  const [logoStyle, setLogoStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    height: '70%',
    objectFit: 'contain',
    filter: 'invert(1) brightness(0.82)',
    pointerEvents: 'none',
    maxWidth: 'none',
    maxHeight: 'none',
  })

  useEffect(() => {
    let cancelled = false

    const fontVar = typeof window !== 'undefined'
      ? (getComputedStyle(document.documentElement).getPropertyValue('--font-inter') || 'Inter')
      : 'Inter'
    const fontName = fontVar.trim()

    // The square stage may not have a measured width on first paint. Retry on
    // animation frames until it does, otherwise packing bails forever, `placed`
    // stays empty, this section never pins, and the page (and CTA order) breaks.
    const start = () => {
      if (cancelled) return
      const sq = sqRef.current
      if (!sq) { requestAnimationFrame(start); return }
      const S = sq.getBoundingClientRect().width
      if (!S) { requestAnimationFrame(start); return }

      if (typeof document !== 'undefined' && 'fonts' in document) {
        document.fonts.ready.then(() => {
          if (!cancelled) pack(sq, S)
        })
      } else {
        pack(sq, S)
      }
    }

    const pack = (sq: HTMLDivElement, S: number) => {
      const img = preloadedImage || new Image()
      if (!preloadedImage) {
        img.src = FAVICON_SRC
      }

      const runPack = () => {
        if (cancelled) return

        const G    = 164               // occupancy grid resolution (finer = crisper edges/tail)
        const cell = S / G
        const basePx = S * 0.068

        // 1) rasterize favicon -> luminance, crop to the elephant's bbox, map
        //    that (square-aspect) region into a GxG inside-mask.
        const R = 240
        const oc = document.createElement('canvas')
        oc.width = R; oc.height = R
        const octx = oc.getContext('2d')!
        octx.drawImage(img, 0, 0, R, R)
        const px = octx.getImageData(0, 0, R, R).data
        const darkAt = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= R || y >= R) return false
          const i = (y * R + x) * 4
          if (px[i + 3] < 40) return false                    // transparent
          return px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114 < 110  // dark ink
        }
        // bounding box of the ink
        let bx0 = R, by0 = R, bx1 = 0, by1 = 0
        for (let y = 0; y < R; y++)
          for (let x = 0; x < R; x++)
            if (darkAt(x, y)) {
              if (x < bx0) bx0 = x; if (x > bx1) bx1 = x
              if (y < by0) by0 = y; if (y > by1) by1 = y
            }
        const bs = Math.max(bx1 - bx0, by1 - by0) * 1.04       // square, tiny margin
        const ox = (bx0 + bx1) / 2 - bs / 2
        const oy = (by0 + by1) / 2 - bs / 2

        const insideArr = new Uint8Array(G * G)
        const rowMin = new Int16Array(G).fill(-1)
        const rowMax = new Int16Array(G).fill(-1)
        for (let gy = 0; gy < G; gy++) {
          for (let gx = 0; gx < G; gx++) {
            const sx = Math.round(ox + (gx / (G - 1)) * bs)
            const sy = Math.round(oy + (gy / (G - 1)) * bs)
            if (darkAt(sx, sy)) {
              insideArr[gy * G + gx] = 1
              if (rowMin[gy] < 0) rowMin[gy] = gx
              rowMax[gy] = gx
            }
          }
        }
        const inside = (gx: number, gy: number) =>
          gx >= 0 && gy >= 0 && gx < G && gy < G && insideArr[gy * G + gx] === 1
        const occupied = new Uint8Array(G * G)

        // 2) in-memory canvas measurement (performance optimization, no DOM thrashing)
        const mCanvas = document.createElement('canvas')
        const mCtx = mCanvas.getContext('2d')!
        const measure = (text: string, fs: number, w: number) => {
          mCtx.font = `${w} ${fs}px ${fontName}, sans-serif`
          const metrics = mCtx.measureText(text.toUpperCase())
          return { w: metrics.width, h: fs }
        }

        // 3) word list with preferred vertical band; large first
        const N = SOURCE.length
        const items = SOURCE.map(([text, tier], i) => {
          const t = TIER[tier]
          return { text, fs: basePx * t.size, op: t.op, weight: t.weight, py: i / (N - 1) }
        })
        for (let pass = 0; pass < 6; pass++) {
          FILLER.forEach((text, i) => {
            // later passes are smaller and biased to the lower body / trunk / tail,
            // so the narrow bottom of the silhouette packs precisely.
            const lower = pass >= 3
            const tier: Tier = lower ? 'xs' : ((i + pass) % 3 === 0 ? 's' : 'xs')
            const t = TIER[tier]
            const py = lower ? 0.58 + Math.random() * 0.42 : Math.random()
            items.push({ text, fs: basePx * t.size, op: t.op, weight: t.weight, py })
          })
        }
        const order = items.map((_it, i) => i).sort((a, b) => items[b].fs - items[a].fs)

        // 4) greedy placement: word box must fit fully inside the mask; centre it
        //    on the shape's per-row middle so words hug the silhouette.
        const rectFree = (gx: number, gy: number, cw: number, ch: number) => {
          for (let yy = gy; yy < gy + ch; yy++)
            for (let xx = gx; xx < gx + cw; xx++) {
              if (!inside(xx, yy)) return false
              if (occupied[yy * G + xx]) return false
            }
          return true
        }
        const mark = (gx: number, gy: number, cw: number, ch: number) => {
          for (let yy = gy; yy < gy + ch; yy++)
            for (let xx = gx; xx < gx + cw; xx++) occupied[yy * G + xx] = 1
        }

        const result: Placed[] = []
        for (const idx of order) {
          const it = items[idx]
          const { w, h } = measure(it.text, it.fs, it.weight)
          const cw = Math.ceil(w / cell) + 2
          const ch = Math.ceil(h / cell) + 2
          if (cw >= G || ch >= G) continue

          const prefGy = Math.round(it.py * (G - 1))
          let best: { gx: number; gy: number } | null = null

          for (let d = 0; d <= G && !best; d++) {
            for (const sign of d === 0 ? [0] : [1, -1]) {
              const gy = prefGy + sign * d
              if (gy < 0 || gy + ch > G) continue
              // centre of the shape across the rows this word would occupy
              let lo = G, hi = -1
              for (let yy = gy; yy < gy + ch; yy++) {
                if (rowMin[yy] >= 0 && rowMin[yy] < lo) lo = rowMin[yy]
                if (rowMax[yy] > hi) hi = rowMax[yy]
              }
              if (hi < 0) continue
              const prefCx = (lo + hi) / 2
              let bestGx = -1, bestDist = Infinity
              for (let gx = 0; gx + cw <= G; gx++) {
                if (!rectFree(gx, gy, cw, ch)) continue
                const dist = Math.abs(gx + cw / 2 - prefCx)
                if (dist < bestDist) { bestDist = dist; bestGx = gx }
              }
              if (bestGx >= 0) { best = { gx: bestGx, gy }; break }
            }
          }
          if (!best) continue
          mark(best.gx, best.gy, cw, ch)
          result.push({
            text: it.text,
            x: (best.gx * cell) / S,
            y: (best.gy * cell) / S,
            fontSize: it.fs / S,
            op: it.op,
            weight: it.weight,
          })
        }

        const scaleVal = R / bs
        const wPct = scaleVal * 100
        const xPct = -(ox / bs) * 100
        const yPct = -(oy / bs) * 100

        setLogoStyle({
          position: 'absolute',
          left: `${xPct}%`,
          top: `${yPct}%`,
          width: `${wPct}%`,
          height: `${wPct}%`,
          objectFit: 'fill',
          filter: 'invert(1) brightness(0.82)',
          pointerEvents: 'none',
          maxWidth: 'none',
          maxHeight: 'none',
        })

        setPlaced(result)
      }

      if (img.complete) {
        runPack()
      } else {
        img.onload = runPack
      }
    }

    start()
    return () => { cancelled = true }
  }, [])

  // ---- Phase animation: runs once the words are placed ---------------------
  useEffect(() => {
    if (!placed.length) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const words = wordRefs.current.filter(Boolean) as HTMLSpanElement[]

    // Fragments scatter across the ENTIRE viewport — they start spread edge to
    // edge, then converge into the favicon on scroll. Spread is sized to the
    // viewport (not fixed px) so it fills the whole screen on any display.
    const vw = window.innerWidth
    const vh = window.innerHeight
    const scatter = words.map(() => ({
      x: gsap.utils.random(-vw * 0.46, vw * 0.46),
      y: gsap.utils.random(-vh * 0.5, vh * 0.5),
      r: gsap.utils.random(-40, 40),
    }))

    // ── Reconstruction staging ────────────────────────────────────────
    // Classify each word by where it sits in the silhouette, then build the
    // shape in three chapters: trunk (lower-left) → body → head + ear
    // (upper-right). A diagonal sweep score orders the words along that path.
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    placed.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
    })
    const spanX = Math.max(1, maxX - minX)
    const spanY = Math.max(1, maxY - minY)
    const sweep = placed.map((p, i) => {
      const nx = (p.x - minX) / spanX           // 0 = left (trunk)
      const ny = (p.y - minY) / spanY           // 0 = top (head/ear)
      return { i, s: nx + (1 - ny) }            // small = lower-left, large = upper-right
    })
    sweep.sort((a, b) => a.s - b.s)
    const n = sweep.length
    const stageOf = new Array<number>(n)
    const stageCount = [0, 0, 0]
    sweep.forEach((w, rank) => {
      const f = rank / n
      stageOf[w.i] = f < 0.15 ? 0 : f < 0.60 ? 1 : 2   // 15% trunk · 45% body · 40% head+ear
    })
    const stageRank = new Array<number>(n).fill(0)
    const stageSeen = [0, 0, 0]
    sweep.forEach(w => { stageRank[w.i] = stageSeen[stageOf[w.i]]++ })

    gsap.set(vapourRef.current, { opacity: 0 })
    gsap.set(faviconImgRef.current, { opacity: 0 })
    gsap.set([ps1.current, ps2.current, ps3.current, psClose1.current, psClose2.current], { clipPath: H })
    words.forEach((el, i) => {
      // Fragments start visible at low opacity — the knowledge exists, unstructured
      gsap.set(el, { opacity: 0.12, x: scatter[i].x, y: scatter[i].y, rotate: scatter[i].r, scale: 0.8 })
    })

    if (reduced) {
      words.forEach((el, i) => gsap.set(el, { opacity: placed[i].op, x: 0, y: 0, rotate: 0, scale: 1 }))
      gsap.set(vapourRef.current, { opacity: 1 })
      gsap.set([ps1.current, ps2.current, ps3.current, psClose1.current, psClose2.current], { clipPath: V })
      return
    }

    // Scale pinned-scroll distance to the device — desktop keeps the exact
    // tuned pacing (×1), tablet/mobile get shorter pins. Re-evaluated on refresh.
    const pinFactor = () =>
      window.innerWidth < 640 ? 0.45 : window.innerWidth < 1024 ? 0.78 : 1

    const ctx = gsap.context(() => {
      const mega = gsap.timeline({
        scrollTrigger: {
          trigger: megaRef.current, pin: true, anticipatePin: 1,
          refreshPriority: 2,
          start: 'top top', end: () => '+=' + 2200 * pinFactor(), scrub: 0.7,
        },
      })

      // ── Reconstruction begins immediately after "UNOTUSK changes that" ──
      mega.to(vapourRef.current, { opacity: 1, ease: 'none', duration: 0.4 }, 0.0)

      const STAGE = [
        { start: 0.3,  span: 0.8 },   // trunk — the first hint
        { start: 1.4,  span: 1.0 },   // body
        { start: 2.7,  span: 1.2 },   // head + ear — recognition completes
      ]
      words.forEach((el, i) => {
        const st  = STAGE[stageOf[i]]
        const cnt = Math.max(1, stageSeen[stageOf[i]])
        const at  = st.start + (stageRank[i] / cnt) * st.span
        mega.to(el, {
          opacity: placed[i].op, x: 0, y: 0, rotate: 0, scale: 1,
          ease: 'power2.out', duration: 0.6,
        }, at)
      })

      // brief holds
      mega.to({}, { duration: 0.3 }, 1.2)
      mega.to({}, { duration: 0.3 }, 2.5)

      // completed typography favicon hold
      mega.to({}, { duration: 0.6 }, 4.0)

      // Letters dissolve into clean favicon
      mega.to(words, { opacity: 0, ease: 'power2.in', duration: 0.8 }, 4.8)
      mega.to(faviconImgRef.current, { opacity: 0.82, ease: 'power1.out', duration: 0.8 }, 5.0)

      // HOLD: clean favicon
      mega.to({}, { duration: 0.5 }, 5.9)

      // Favicon fades away, and simultaneously, the solution begins to reveal!
      // This completely avoids any black blank screen transition gap!
      mega.to(faviconImgRef.current, { opacity: 0, ease: 'power2.in', duration: 0.6 }, 6.5)

      // Start revealing solution lines immediately at 6.8
      mega.to(ps1.current, { clipPath: V, ease: 'none', duration: 0.6 }, 6.8)
      mega.to(ps2.current, { clipPath: V, ease: 'none', duration: 0.6 }, 7.4)
      mega.to(ps3.current, { clipPath: V, ease: 'none', duration: 0.6 }, 8.0)
      
      // hold for solution
      mega.to({}, { duration: 0.8 }, 8.7)

      // Reveal closing line
      mega.to(psClose1.current, { clipPath: V, ease: 'none', duration: 0.6 }, 9.6)
      mega.to(psClose2.current, { clipPath: V, ease: 'none', duration: 0.6 }, 10.2)
      
      // FINAL HOLD before invitation
      mega.to({}, { duration: 0.8 }, 10.9)
    }, containerRef)

    // This pinned trigger is created LATE (after async favicon load + packing).
    // Sibling triggers (esp. the CTA) were created earlier and cached their
    // start/end BEFORE this section's ~13000px pin-spacer existed, so the CTA's
    // pin range ends up nested inside this one. A refresh recomputes every
    // trigger's scroll math against the final layout, pushing the CTA below.
    // Ensure all triggers are refreshed after a slight delay to allow full DOM render and spacing stability
    // Ensure all triggers are refreshed after a slight delay to allow full DOM render and spacing stability.
    // We run a double-refresh timer and dispatch a window resize event to force Lenis smooth scroll
    // to recalculate its cached scroll heights and prevent scrolling limits from locking.
    const timer1 = setTimeout(() => {
      ScrollTrigger.refresh()
      window.dispatchEvent(new Event('resize'))
    }, 150)

    const timer2 = setTimeout(() => {
      ScrollTrigger.refresh()
      window.dispatchEvent(new Event('resize'))
    }, 450)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      ctx.revert()
    }
  }, [placed])

  const serif: React.CSSProperties = { fontFamily: "var(--font-young-serif), 'Young Serif', Georgia, serif" }
  const mono:  React.CSSProperties = { fontFamily: 'var(--font-inter), sans-serif' }

  return (
    <div ref={containerRef} style={{ background: '#0B1020', color: '#CBC1B5' }}>

      {/* Favicon word cloud + product statement */}
      <div
        ref={megaRef}
        className="relative overflow-hidden"
        style={{ minHeight: '100vh', background: '#0B1020' }}
        role="region"
        aria-label="Project knowledge forming the UNOTUSK elephant"
      >
        <div
          ref={vapourRef}
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 58% 56% at 50% 47%, rgba(203,193,181,0.03) 0%, transparent 66%)',
          }}
        />

        {/* Square stage — packed words form the elephant */}
        <div
          ref={sqRef}
          aria-hidden="true"
          style={{
            position: 'absolute', left: '50%', top: 'calc(50% + 32px)',
            transform: 'translate(-50%, -50%) scale(clamp(0.5, calc(80vw / 480px), 1.0))',
            width: STAGE_SIZE, height: STAGE_SIZE,
            pointerEvents: 'none',
          }}
        >
          {placed.map((p, i) => (
            <span
              key={i}
              ref={el => { wordRefs.current[i] = el }}
              style={{
                position: 'absolute',
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                ...mono,
                fontSize: `calc(${p.fontSize} * ${STAGE_SIZE})`,
                fontWeight: p.weight,
                opacity: p.op,
                color: '#CBC1B5',
                letterSpacing: '0.01em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}
            >
              {p.text}
            </span>
          ))}
          {/* Clean favicon — appears after the word cloud dissolves */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <img
              ref={faviconImgRef}
              src={FAVICON_SRC}
              alt=""
              aria-hidden="true"
              style={logoStyle}
            />
          </div>
        </div>

        {/* Product statement */}
        <div style={{ position: 'absolute', left: '7vw', bottom: '18%' }}>
          <div
            ref={ps1}
            style={{
              ...serif, clipPath: H,
              fontSize: 'clamp(1.8rem, 4vw, 4rem)', lineHeight: 1.05,
              letterSpacing: '-0.025em', color: '#CBC1B5',
            }}
          >
            UNOTUSK gives AI
          </div>
          <div
            ref={ps2}
            style={{
              ...serif, clipPath: H,
              fontSize: 'clamp(1.8rem, 4vw, 4rem)', lineHeight: 1.05,
              letterSpacing: '-0.025em', color: '#CBC1B5',
            }}
          >
            the one thing it&rsquo;s missing&mdash;
          </div>
          <div
            ref={ps3}
            style={{
              ...serif, clipPath: H,
              fontSize: 'clamp(1.8rem, 4vw, 4rem)', lineHeight: 1.05,
              letterSpacing: '-0.025em', color: 'rgba(203,193,181,0.62)',
            }}
          >
            your project&rsquo;s memory.
          </div>
        </div>

        {/* Closing statement */}
        <div style={{ position: 'absolute', right: '7vw', bottom: '10%', textAlign: 'right' }}>
          <div
            ref={psClose1}
            style={{
              ...mono, clipPath: H,
              fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
              letterSpacing: '0.03em',
              color: 'rgba(203,193,181,0.45)',
              lineHeight: 1.7,
            }}
          >
            Your project already knows.
          </div>
          <div
            ref={psClose2}
            style={{
              ...mono, clipPath: H,
              fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
              letterSpacing: '0.03em',
              color: 'rgba(203,193,181,0.62)',
              lineHeight: 1.7,
            }}
          >
            UNOTUSK makes it visible.
          </div>
        </div>
      </div>

      <div style={{ height: '60vh', background: '#0B1020' }} aria-hidden="true" />
    </div>
  )
}
