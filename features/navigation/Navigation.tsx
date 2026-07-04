'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SITE } from '@/lib/constants'
import { AnimatedThemeToggle } from '@/components/AnimatedThemeToggle'
import { motion } from 'framer-motion'

interface NavigationProps {
  onOpenModal: () => void
  initialAnimDone?: boolean
}

export function Navigation({ onOpenModal, initialAnimDone = false }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  // The CTA is the conclusion of the story — it must not appear until the
  // visitor has travelled through the entire solution. Reveal it only once
  // they reach the final stretch of the page (the CTA section).
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32)
      setShowCTA(window.scrollY > 400)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        transition: 'background 0.5s ease, border-color 0.5s ease',
        background: scrolled ? 'var(--color-nav-bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--color-nav-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <style>{`
        @media (max-width: 439px) {
          .nav-box {
            flex-direction: column !important;
            gap: 0.15rem !important;
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
        }
      `}</style>
      <nav
        className="nav-box mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12 lg:px-16 transition-all duration-300 ease-in-out"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="transition-opacity duration-300"
          aria-label={SITE.name}
        >
          <Image
            src="/logo.svg"
            alt={SITE.name}
            width={183}
            height={56}
            priority
            className="h-[56px] w-auto nav-logo-img"
          />
        </Link>
 
        {/* Right-aligned Navigation Controls */}
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: (initialAnimDone && scrolled) ? 1 : 0,
              scale: (initialAnimDone && scrolled) ? 1 : 0.8,
              pointerEvents: (initialAnimDone && scrolled) ? 'auto' : 'none'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <AnimatedThemeToggle />
          </motion.div>
 
          {/* CTA — only after the solution story has finished */}
          <button
            onClick={onOpenModal}
            aria-hidden={!showCTA}
            tabIndex={showCTA ? undefined : -1}
            className={[
              'group flex items-center gap-1.5 justify-center cursor-pointer bg-transparent border-0 p-0 outline-none',
              'font-sans text-[clamp(10px,0.85vw,12px)] uppercase tracking-[0.12em]',
              'text-primary/80 transition-all duration-500 hover:text-accent',
              showCTA ? 'opacity-100 min-h-[44px] max-h-12 mt-1 pointer-events-auto' : 'pointer-events-none opacity-0 min-h-0 max-h-0 overflow-hidden',
            ].join(' ')}
          >
            <span>Join Lighthouse</span>
            <span
              className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        </div>
      </nav>
    </header>
  )
}
