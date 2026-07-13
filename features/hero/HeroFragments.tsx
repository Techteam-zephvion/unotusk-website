'use client'

export interface Fragment {
  text: string
  x: string
  y: string
  opacity: number
  blur: number
  size: number   // px
  rotate?: number
  mono?: boolean
}

// Fragments cluster around the card (centre-left of viewport).
// Outer regions are sparse. This creates the illusion of depth around the card.
export const FRAGMENTS: Fragment[] = [
  // Dense cluster — just outside the card
  { text: 'PR-482', x: '8%', y: '22%', opacity: 0.14, blur: 1.2, size: 10 },
  { text: 'checkout.ts', x: '14%', y: '38%', opacity: 0.10, blur: 1.8, size: 9, rotate: -2 },
  { text: 'Rejected', x: '6%', y: '52%', opacity: 0.16, blur: 0.8, size: 11, rotate: -5 },
  { text: 'commit a9f83d', x: '11%', y: '66%', opacity: 0.08, blur: 2.2, size: 9 },
  { text: 'March Incident', x: '20%', y: '76%', opacity: 0.11, blur: 1.5, size: 10, rotate: 2 },
  { text: 'Slack', x: '3%', y: '44%', opacity: 0.13, blur: 1.0, size: 11 },
  { text: 'Owner', x: '24%', y: '18%', opacity: 0.09, blur: 2.0, size: 9 },
  { text: 'Risk', x: '30%', y: '82%', opacity: 0.10, blur: 1.5, size: 10, rotate: -3 },
  { text: 'auth-flow.ts', x: '16%', y: '12%', opacity: 0.07, blur: 2.5, size: 9 },
  { text: 'WONTFIX', x: '5%', y: '78%', opacity: 0.12, blur: 1.2, size: 10, rotate: 4 },
  // Mid distance — around card periphery
  { text: 'Latency', x: '58%', y: '14%', opacity: 0.08, blur: 2.5, size: 9 },
  { text: 'Decision', x: '62%', y: '78%', opacity: 0.09, blur: 2.0, size: 9, rotate: -2 },
  { text: 'Stripe', x: '68%', y: '22%', opacity: 0.07, blur: 2.8, size: 9 },
  { text: 'Webhook', x: '72%', y: '64%', opacity: 0.06, blur: 3.0, size: 9, rotate: 3 },
  { text: 'Incident', x: '55%', y: '88%', opacity: 0.08, blur: 2.2, size: 10 },
  // Far edge — barely there
  { text: 'Notion', x: '84%', y: '38%', opacity: 0.05, blur: 3.5, size: 9 },
  { text: 'deprecated', x: '88%', y: '72%', opacity: 0.04, blur: 4.0, size: 9, rotate: -4 },
  { text: 'v2 rollback', x: '78%', y: '18%', opacity: 0.05, blur: 3.5, size: 9 },
  { text: 'tech-debt', x: '91%', y: '52%', opacity: 0.04, blur: 4.0, size: 9, rotate: 2 },
  { text: 'Jira', x: '94%', y: '28%', opacity: 0.05, blur: 3.8, size: 10 },
]

interface HeroFragmentsProps {
  scrollProgress: number
}

export function HeroFragments({ scrollProgress }: HeroFragmentsProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {FRAGMENTS.map((f, i) => {
        const nearCard = i < 10  // first 10 are close to the card
        const revealBoost = nearCard ? 1.6 : 0.8
        const revealFactor = Math.min(1, scrollProgress * revealBoost)
        const opacity = f.opacity + revealFactor * f.opacity * 1.2
        const blur = Math.max(0.2, f.blur - revealFactor * f.blur * 0.5)

        return (
          <span
            key={i}
            className="absolute font-mono text-[#F5F3EF] uppercase tracking-[0.18em]"
            style={{
              left: f.x,
              top: f.y,
              fontSize: `${f.size}px`,
              opacity,
              filter: `blur(${blur}px)`,
              transform: f.rotate ? `rotate(${f.rotate}deg)` : undefined,
              transition: 'opacity 0.8s ease, filter 0.8s ease',
              lineHeight: 1,
            }}
          >
            {f.text}
          </span>
        )
      })}
    </div>
  )
}
