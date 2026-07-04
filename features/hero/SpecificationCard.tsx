// The single completely sharp element in the hero.
// Styled as a recovered artifact — minimal chrome, monospace metadata,
// clear signal inside noise.

const META = [
  { label: 'source',  value: 'PR-482 · checkout.ts' },
  { label: 'date',    value: 'March 2024' },
  { label: 'status',  value: 'Rejected' },
]

export function SpecificationCard() {
  return (
    <article
      className="relative w-full max-w-[400px] overflow-hidden rounded-2xl"
      style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        backdropFilter: 'blur(2px)',
        boxShadow: '0 32px 80px var(--color-card-shadow), 0 0 0 1px var(--color-border)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
          recovered context
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-[5px] w-[5px] rounded-full"
            style={{ background: 'var(--color-accent)', opacity: 0.7 }}
          />
          <span className="font-mono text-[9px] tracking-widest text-primary/40 uppercase">
            live
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="px-6 pt-6 pb-5">
        <p className="text-[15px] font-medium leading-[1.5] tracking-[-0.01em] text-primary">
          Payment retry logic
          <br />
          was previously rejected.
        </p>
        <p className="mt-3 font-mono text-[12px] leading-relaxed text-primary/70">
          March incident.
        </p>
      </div>

      {/* Metadata rows */}
      <div
        className="px-6 pb-5 space-y-2"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="h-3" />
        {META.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary/35">
              {label}
            </span>
            <span className="font-mono text-[10px] tracking-wide text-primary/60">
              {value}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
