'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const H = 'inset(0 100% 0 0)'
const V = 'inset(0 0% 0 0)'

// The packing mask is rasterized at runtime from the real Unotusk favicon
// so the word cloud takes the icon's EXACT silhouette (eye becomes a gap).
const FAVICON_SRC = '/favicon.svg'

const SILHOUETTE_PATH =
  "M212.27,366.69c-3.46-2.1-5.74-5.67-5.74-9.71,0-.84.1-1.66.29-2.45.62-2.62-.99-5.26-3.62-5.87-16.69-3.92-29.05-18.04-29.05-34.85,0-6.41,1.8-12.43,4.94-17.64,3.14-5.21,7.64-9.61,13.05-12.79,12.51-4.59,21.33-15.79,21.33-28.88,0-17.18-15.2-31.11-33.96-31.11-8.74,0-16.71,3.02-22.73,7.99l-.06-.08c-18.62,14.25-30.51,35.91-30.51,60.16,0,.36,0,.71,0,1.07-.03.03-.07.05-.11.07-5.96,3.83-13.11,6.71-21.01,8.31-4.61.94-9.47,1.44-14.5,1.44-.97,0-1.95-.02-2.91-.06-.35-.01-.67.08-.94.24-.27.18-.5.42-.64.72.09.36.23.72.4,1.07,2.65,5.38,14.41,9.44,28.52,9.44,3.16,0,6.21-.2,9.06-.58,1.79-.24,3.5-.55,5.13-.91.27-.06.54-.13.81-.19,2.48-.6,4.88-1.5,7.15-2.66,2.54-1.29,5.1-2.53,7.72-3.66l10.1-4.35c3.24-1.4,5.32-4.38,5.71-7.65.51,3.87-1.72,7.73-5.71,9.34l-10.1,4.08c-2.61,1.06-5.18,2.21-7.72,3.43-2.27,1.09-4.67,1.93-7.15,2.5-.17.04-.35.08-.52.12,10.07,32.32,41.98,55.93,79.79,55.93,1.31,0,2.61-.03,3.91-.09.15,0,.26-.13.26-.28,0-.86-.46-1.65-1.2-2.09ZM158.56,264.21c-1.84,1.15-3.5,1.25-3.19-1.54.25-2.28,2.84-4.38,4.59-5.61,2.53-1.77,5.76-2.69,8.76-1.96,2.99.74,5.58,3.36,5.76,6.44-5.72-1.95-11-.4-15.91,2.66Z"

// ---------------------------------------------------------------------------
// Word source. tier = size/weight. The list runs head -> trunk; each word's
// index gives its preferred vertical band, so decision vocabulary packs into
// the head and code/infra vocabulary into the body and trunk.
// ---------------------------------------------------------------------------
type Tier = 'xl' | 'l' | 'm' | 's' | 'xs'
const TIER: Record<Tier, { size: number; op: number; weight: number }> = {
  xl: { size: 0.68, op: 0.96, weight: 700 },
  l: { size: 0.46, op: 0.84, weight: 600 },
  m: { size: 0.35, op: 0.64, weight: 500 },
  s: { size: 0.26, op: 0.46, weight: 400 },
  xs: { size: 0.18, op: 0.30, weight: 400 },
}

const SOURCE: [string, Tier][] = [
  // ---- HEAD (decision / product) ----
  ['STRATEGY', 'm'], ['STAKEHOLDER', 's'], ['SUCCESS-CRITERIA', 's'],
  ['DECIDER', 'm'], ['CODE', 's'], ['ACCEPTANCE-CRITERIA', 'xs'],
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
  ['FUNCTION()', 'm'], ['SCOPE', 'xl'], ['CLASS', 's'], ['ASYNC', 'xs'],
  ['TESTING', 'l'], ['UNIT-TEST', 's'], ['INTEGRATION-TEST', 'xs'],
  // ---- LOWER BODY / TRUNK (infra / ops) ----
  ['MONITORING', 'xl'], ['LOGGING', 's'],
  ['DEFAULT', 'xs'], ['RETURN', 's'], ['CI/CD', 'l'], ['TEST-CASE', 's'],
  ['PIPELINE', 'm'], ['STATIC-ANALYSIS', 's'], ['SONAR', 'xs'], ['TAG', 'xs'],
  ['BUILD', 'm'], ['CONTAINER-IMAGE', 's'], ['DOCKERFILE', 'xs'],
  ['DEPLOY', 'l'], ['ENVIRONMENT', 's'], ['STAGING', 'xs'],
  ['ALERT', 'xs'], ['METRICS', 'm'],
  ['DASHBOARD', 'xs'], ['TRACE', 's'], ['HEALTH-CHECK', 'xs'], ['PERFORMANCE', 's'],
  ['THROUGHPUT', 'xs'], ['LATENCY', 's'], ['ERROR-RATE', 'xs'],
  ['DATABASE', 'xl'], ['SCHEMA', 's'], ['MIGRATION', 'xs'], ['TRANSACTION', 's'],
  ['QUERY', 'xs'], ['INDEX', 'm'], ['CACHE', 'l'], ['REDIS', 's'],
  ['SEARCH', 'l'], ['ELASTIC', 'xs'], ['STORAGE', 'l'], ['BACKUP', 'xs'],
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
  const STAGE_SIZE = 'clamp(300px, 82vmin, 700px)'
  const containerRef = useRef<HTMLDivElement>(null)
  const megaRef = useRef<HTMLDivElement>(null)
  const sqRef = useRef<HTMLDivElement>(null)
  const vapourRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const ps1 = useRef<HTMLDivElement>(null)
  const ps2 = useRef<HTMLDivElement>(null)
  const ps3 = useRef<HTMLDivElement>(null)
  const faviconImgRef = useRef<HTMLImageElement>(null)
  const psClose1 = useRef<HTMLDivElement>(null)
  const psClose2 = useRef<HTMLDivElement>(null)
  const bridgeT = useRef<HTMLDivElement>(null)

  const [placed, setPlaced] = useState<Placed[]>([])
  const [logoStyle, setLogoStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    height: '70%',
    objectFit: 'contain',
    filter: 'var(--color-logo-filter)',
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
      if (cancelled) return

      const R = 230
      const oc = document.createElement('canvas')
      oc.width = R; oc.height = R
      const octx = oc.getContext('2d')!

      // Draw the official silhouette path directly on the canvas without any extra margins/translations
      octx.translate(-34.8, -181.3)
      octx.fillStyle = '#000'
      octx.fill(new Path2D(SILHOUETTE_PATH))

      const px = octx.getImageData(0, 0, R, R).data
      const darkAt = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= R || y >= R) return false
        const i = (y * R + x) * 4
        return px[i + 3] > 0 // Any non-transparent pixel is logo ink
      }

      const G = 164               // occupancy grid resolution
      const cell = S / G
      const basePx = S * 0.068

      const insideArr = new Uint8Array(G * G)
      const rowMin = new Int16Array(G).fill(-1)
      const rowMax = new Int16Array(G).fill(-1)
      for (let gy = 0; gy < G; gy++) {
        for (let gx = 0; gx < G; gx++) {
          const cx = Math.round((gx / (G - 1)) * (R - 1))
          const cy = Math.round((gy / (G - 1)) * (R - 1))
          if (darkAt(cx, cy)) {
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

        // Add tighter padding for small words to fit the narrow curves of the trunk
        const padding = it.fs < basePx * 0.3 ? 1 : 2
        const cw = Math.ceil(w / cell) + padding
        const ch = Math.ceil(h / cell) + padding
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

      setLogoStyle({
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: 'var(--color-logo-filter)',
        pointerEvents: 'none',
        maxWidth: 'none',
        maxHeight: 'none',
      })

      setPlaced(result)
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
    gsap.set(faviconImgRef.current, { opacity: 0, scale: 0.95 })
    gsap.set(bridgeT.current, { opacity: 1, filter: 'blur(0px)' })
    gsap.set([ps1.current, ps2.current, ps3.current, psClose1.current, psClose2.current], { clipPath: H })
    words.forEach((el, i) => {
      // Fragments start at opacity 0 to prevent overlaying the bridge text on entry
      gsap.set(el, { opacity: 0, x: scatter[i].x, y: scatter[i].y, rotate: scatter[i].r, scale: 0.8 })
    })

    if (reduced) {
      words.forEach((el, i) => gsap.set(el, { opacity: placed[i].op, x: 0, y: 0, rotate: 0, scale: 1 }))
      gsap.set(vapourRef.current, { opacity: 1 })
      gsap.set(bridgeT.current, { opacity: 0 })
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
          start: 'top top', end: () => '+=' + 2600 * pinFactor(), scrub: 0.4,
        },
      })

      // ── Reconstruction begins immediately after "Unotusk changes that" ──
      mega.to(bridgeT.current, { opacity: 0, filter: 'blur(6px)', ease: 'power2.in', duration: 0.45 }, 0.0)
      mega.to(vapourRef.current, { opacity: 1, ease: 'none', duration: 0.45 }, 0.05)
      mega.to(words, { opacity: 0.12, ease: 'power1.out', duration: 0.45 }, 0.05)

      const STAGE = [
        { start: 0.2, span: 0.5 },   // trunk
        { start: 0.4, span: 0.5 },   // body (starts almost immediately with trunk)
        { start: 0.7, span: 0.6 },   // head + ear (coalesces together, completes at 1.3)
      ]
      words.forEach((el, i) => {
        const st = STAGE[stageOf[i]]
        const cnt = Math.max(1, stageSeen[stageOf[i]])
        const at = st.start + (stageRank[i] / cnt) * st.span
        // 1) Fly in and lock with glowing gold/amber light
        mega.to(el, {
          opacity: placed[i].op, x: 0, y: 0, rotate: 0, scale: 1,
          color: 'var(--color-glow)',
          textShadow: '0 0 10px rgba(245, 194, 122, 0.45)',
          ease: 'power2.out', duration: 0.4,
        }, at)
        // 2) Fade color back to normal text color and clear text shadow
        mega.to(el, {
          color: 'var(--color-text-primary)',
          textShadow: 'none',
          ease: 'power1.inOut', duration: 0.5,
        }, at + 0.3)
      })

      // brief holds
      mega.to({}, { duration: 0.1 }, 0.7)
      mega.to({}, { duration: 0.1 }, 1.0)

      // completed typography favicon hold
      mega.to({}, { duration: 0.3 }, 1.4)

      // Letters dissolve into clean favicon
      mega.to(words, { opacity: 0, ease: 'power2.in', duration: 0.4 }, 1.8)
      mega.to(faviconImgRef.current, { opacity: 0.92, scale: 1, ease: 'power1.out', duration: 0.4 }, 1.9)

      // HOLD: clean favicon
      mega.to({}, { duration: 0.3 }, 2.3)

      // Start revealing solution lines immediately at 2.9 (favicon stays visible now)
      mega.to(ps1.current, { clipPath: V, ease: 'none', duration: 0.5 }, 2.9)
      mega.to(ps2.current, { clipPath: V, ease: 'none', duration: 0.5 }, 3.5)
      mega.to(ps3.current, { clipPath: V, ease: 'none', duration: 0.5 }, 4.1)

      // Fade out favicon — opacity only, no scale/blur so the shape stays clean
      mega.to(faviconImgRef.current, { opacity: 0, ease: 'sine.inOut', duration: 1.4 }, 2.8)

      // Minimal hold after solution to avoid wasted scroll energy
      mega.to({}, { duration: 0.2 }, 4.6)

      // Reveal closing line slightly earlier to ensure full visibility before unpinning
      mega.to(psClose1.current, { clipPath: V, ease: 'none', duration: 0.5 }, 4.4)
      mega.to(psClose2.current, { clipPath: V, ease: 'none', duration: 0.5 }, 5.0)

      // Final hold before unpinning (page text and vapour remain fully visible to prevent blank frames)
      mega.to({}, { duration: 0.2 }, 5.9)
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
  const mono: React.CSSProperties = { fontFamily: 'var(--font-inter), sans-serif' }

  return (
    <div ref={containerRef} style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <style>{`
        .tusk-stage {
          /* Enlarge logo on mobile, keeping it fully responsive */
          --tusk-scale: clamp(1.2, calc(95vw / 300px), 1.65);
          /* Offset visual weight shift of the asymmetric elephant silhouette (trunk on left, ear on right) */
          --tusk-x: -56%;
        }
        @media (min-width: 768px) {
          .tusk-stage {
            --tusk-scale: clamp(0.8, calc(82vw / 700px), 1.4);
            --tusk-x: -50%;
          }
        }
      `}</style>

      {/* Favicon word cloud + product statement */}
      <div
        ref={megaRef}
        className="relative overflow-hidden min-h-dvh"
        style={{ background: 'var(--color-bg)' }}
        role="region"
        aria-label="Project knowledge forming the Unotusk elephant"
      >
        <div
          ref={vapourRef}
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 58% 56% at 50% 47%, var(--color-nav-border) 0%, transparent 66%)',
          }}
        />

        {/* Square stage — packed words form the elephant */}
        <div
          ref={sqRef}
          aria-hidden="true"
          className="tusk-stage"
          style={{
            position: 'absolute', left: '50%', top: 'calc(50dvh + var(--nav-height) / 2)',
            transform: 'translate(var(--tusk-x, -50%), -50%) scale(var(--tusk-scale))',
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
                color: 'var(--color-text-primary)',
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
              style={{
                ...logoStyle,
                filter: 'var(--color-logo-filter)',
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes sparkleTwinkle {
            0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
            40%       { transform: scale(1.05) rotate(72deg); opacity: 1; }
            60%       { transform: scale(0.95) rotate(90deg); opacity: 0.9; }
          }
          @keyframes sparkleDrift {
            0%, 100% { transform: scale(0.55) rotate(-18deg); opacity: 0; }
            50%       { transform: scale(1) rotate(14deg); opacity: 0.88; }
          }
          @keyframes sparkleOrbit {
            0%   { transform: scale(0) rotate(0deg); opacity: 0; }
            35%  { transform: scale(1.1) rotate(65deg); opacity: 1; }
            65%  { transform: scale(0.9) rotate(115deg); opacity: 0.8; }
            100% { transform: scale(0) rotate(180deg); opacity: 0; }
          }
          .sparkle-star {
            position: absolute;
            pointer-events: none;
          }
          .sparkle-a { animation: sparkleTwinkle 2.8s ease-in-out infinite; }
          .sparkle-b { animation: sparkleDrift   3.5s ease-in-out infinite; }
          .sparkle-c { animation: sparkleOrbit   4.2s ease-in-out infinite; }
          /* ── Viewport-proportional star sizes ── */
          .star-sm  { width: clamp(8px, 1.4vw, 14px);  height: clamp(8px, 1.4vw, 14px);  }
          .star-md  { width: clamp(12px, 2vw, 20px);   height: clamp(12px, 2vw, 20px);   }
          .star-lg  { width: clamp(16px, 2.6vw, 26px); height: clamp(16px, 2.6vw, 26px); }
          .bridge-wrap {
            /*
             * Single source-of-truth for size.
             * Logo and text both derive from --text-size so they are always in sync.
             * Max safe: container 86vw, text ≈11.5× font, logo ≈0.76×font → total ≈12.26×font
             * → font = 86vw / 12.26 ≈ 7.01vw → use 6.5vw for safe margin; cap at 3.4rem.
             */
            --text-size: clamp(1.3rem, 6.5vw, 3.4rem);
            position: relative;
            width: min(680px, 86vw);
            padding: 2.25rem 0;
          }
          .bridge-flex {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            flex-wrap: nowrap;
          }
          .bridge-logo {
            /*
             * The SVG silhouette fills only ~55% of its 230×230 viewBox,
             * so we use 1.8× font-size to make the logo visually larger than the text.
             * filter matches the navbar logo treatment (brightness(0) in light mode).
             */
            height: calc(1.8 * var(--text-size));
            width:  calc(1.8 * var(--text-size));
            opacity: 1;
            display: inline-block;
            flex-shrink: 0;
            filter: var(--color-logo-filter);
            margin-right: calc(-0.35 * var(--text-size));
          }
          .bridge-text {
            font-size: var(--text-size);
            letter-spacing: -0.025em;
            color: var(--color-text-primary);
            filter: blur(0px);
            font-weight: 400;
            line-height: 1.04;
            display: inline-block;
            white-space: nowrap;
          }
          .product-statement {
            position: absolute;
            left: 7vw;
            bottom: 22%;
            max-width: 85vw;
          }
          .closing-statement {
            position: absolute;
            right: 7vw;
            bottom: 8%;
            text-align: right;
            max-width: 85vw;
          }
          @media (max-width: 640px) {
            .product-statement { bottom: 26%; }
            .closing-statement { bottom: 12%; }
          }
        `}</style>

        {/* Bridge Statement */}
        <div
          ref={bridgeT}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          <div className="bridge-wrap pointer-events-auto">
            {/* ── 5 Stars: minimal, viewport-scaled, 4-corner + top-center ── */}

            {/* Top-left: 4-point warm gold — large */}
            <svg className="sparkle-star sparkle-a star-lg" style={{ top: 4, left: 6, animationDelay: '0s', color: '#A07C4A' }} viewBox="0 0 21 21">
              <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="currentColor" />
            </svg>

            {/* Top-center: 6-point asterisk — small */}
            <svg className="sparkle-star sparkle-c star-sm" style={{ top: 2, left: '50%', transform: 'translateX(-50%)', animationDelay: '1.4s', color: '#C8A870' }} viewBox="0 0 24 24">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>

            {/* Top-right: 4-point soft gold — medium */}
            <svg className="sparkle-star sparkle-b star-md" style={{ top: 6, right: 6, animationDelay: '0.7s', color: '#C5A880' }} viewBox="0 0 21 21">
              <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="currentColor" />
            </svg>

            {/* Bottom-left: 4-point richest gold — large */}
            <svg className="sparkle-star sparkle-a star-lg" style={{ bottom: 4, left: 10, animationDelay: '1.1s', color: '#B8924E' }} viewBox="0 0 21 21">
              <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="currentColor" />
            </svg>

            {/* Bottom-right: 6-point asterisk — medium */}
            <svg className="sparkle-star sparkle-b star-md" style={{ bottom: 6, right: 8, animationDelay: '1.9s', color: '#A07C4A' }} viewBox="0 0 24 24">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </svg>

            {/* Logo + Text — centered within safe zone */}
            <div className="bridge-flex">
              <svg
                viewBox="34.8 181.3 230 230"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="bridge-logo"
                style={{
                  height: 'clamp(2.34rem, 11.7vw, 6.12rem)',
                  width: 'clamp(2.34rem, 11.7vw, 6.12rem)',
                }}
              >
                <path
                  d="M212.27,366.69c-3.46-2.1-5.74-5.67-5.74-9.71,0-.84.1-1.66.29-2.45.62-2.62-.99-5.26-3.62-5.87-16.69-3.92-29.05-18.04-29.05-34.85,0-6.41,1.8-12.43,4.94-17.64,3.14-5.21,7.64-9.61,13.05-12.79,12.51-4.59,21.33-15.79,21.33-28.88,0-17.18-15.2-31.11-33.96-31.11-8.74,0-16.71,3.02-22.73,7.99l-.06-.08c-18.62,14.25-30.51,35.91-30.51,60.16,0,.36,0,.71,0,1.07-.03.03-.07.05-.11.07-5.96,3.83-13.11,6.71-21.01,8.31-4.61.94-9.47,1.44-14.5,1.44-.97,0-1.95-.02-2.91-.06-.35-.01-.67.08-.94.24-.27.18-.5.42-.64.72.09.36.23.72.4,1.07,2.65,5.38,14.41,9.44,28.52,9.44,3.16,0,6.21-.2,9.06-.58,1.79-.24,3.5-.55,5.13-.91.27-.06.54-.13.81-.19,2.48-.6,4.88-1.5,7.15-2.66,2.54-1.29,5.1-2.53,7.72-3.66l10.1-4.35c3.24-1.4,5.32-4.38,5.71-7.65.51,3.87-1.72,7.73-5.71,9.34l-10.1,4.08c-2.61,1.06-5.18,2.21-7.72,3.43-2.27,1.09-4.67,1.93-7.15,2.5-.17.04-.35.08-.52.12,10.07,32.32,41.98,55.93,79.79,55.93,1.31,0,2.61-.03,3.91-.09.15,0,.26-.13.26-.28,0-.86-.46-1.65-1.2-2.09ZM158.56,264.21c-1.84,1.15-3.5,1.25-3.19-1.54.25-2.28,2.84-4.38,4.59-5.61,2.53-1.77,5.76-2.69,8.76-1.96,2.99.74,5.58,3.36,5.76,6.44-5.72-1.95-11-.4-15.91,2.66Z"
                  fill="var(--color-text-primary)"
                />
              </svg>
              <span
                className="bridge-text"
                style={{ ...serif }}
              >
                Unotusk changes that.
              </span>
            </div>
          </div>
        </div>

        {/* Product statement */}
        <div className="product-statement">
          <div
            ref={ps1}
            style={{
              ...serif, clipPath: H,
              fontSize: 'clamp(1.8rem, 4vw, 4rem)', lineHeight: 1.05,
              letterSpacing: '-0.025em', color: 'var(--color-text-primary)',
              paddingBottom: '0.15em', marginBottom: '-0.15em',
            }}
          >
            Unotusk gives AI
          </div>
          <div
            ref={ps2}
            style={{
              ...serif, clipPath: H,
              fontSize: 'clamp(1.8rem, 4vw, 4rem)', lineHeight: 1.05,
              letterSpacing: '-0.025em', color: 'var(--color-text-primary)',
              paddingBottom: '0.15em', marginBottom: '-0.15em',
            }}
          >
            the one thing it&rsquo;s missing&mdash;
          </div>
          <div
            ref={ps3}
            style={{
              ...serif, clipPath: H,
              fontSize: 'clamp(1.8rem, 4vw, 4rem)', lineHeight: 1.05,
              letterSpacing: '-0.025em', color: 'var(--color-text-secondary)',
              paddingBottom: '0.15em', marginBottom: '-0.15em',
            }}
          >
            your project&rsquo;s memory.
          </div>
        </div>

        <div className="closing-statement">
          <div
            ref={psClose1}
            style={{
              ...mono, clipPath: H,
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              letterSpacing: '0.03em',
              color: 'var(--color-text-primary)',
              opacity: 0.85,
              lineHeight: 1.7,
            }}
          >
            Your project already knows.
          </div>
          <div
            ref={psClose2}
            style={{
              ...mono, clipPath: H,
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              letterSpacing: '0.03em',
              color: 'var(--color-text-primary)',
              opacity: 0.65,
              lineHeight: 1.7,
            }}
          >
            Unotusk makes it visible.
          </div>
        </div>
      </div>

      <div style={{ height: '4vh', background: 'var(--color-bg)' }} aria-hidden="true" />
    </div>
  )
}
