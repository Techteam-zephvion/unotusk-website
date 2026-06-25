'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SITE } from '@/lib/constants'

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        transition: 'background 0.5s ease, border-color 0.5s ease',
        background: scrolled ? 'rgba(9,13,23,0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12 lg:px-16"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="transition-opacity duration-300 hover:opacity-70"
          aria-label={SITE.name}
        >
          <Image
            src="/logo.png.png"
            alt={SITE.name}
            width={180}
            height={180}
            priority
            className="h-[44px] w-auto brightness-0 invert"
          />
        </Link>

        {/* CTA */}
        <Link
          href="#early-access"
          className={[
            'group flex items-center gap-1.5',
            'font-mono text-[11px] uppercase tracking-[0.18em]',
            'text-[#CBC1B5]/70 transition-colors duration-300 hover:text-[#F5F3EF]',
          ].join(' ')}
        >
          <span>Join Lighthouse</span>
          <span
            className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </nav>
    </header>
  )
}
