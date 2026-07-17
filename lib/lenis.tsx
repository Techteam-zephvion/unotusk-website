'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Guarantee the page starts at top on every mount (belt-and-suspenders with ScrollInit)
    window.scrollTo(0, 0)

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true, // Syncs touch scroll events on mobile for smooth scrolling
    })

    // Expose lenis instance globally for custom snapping/scrolling
    if (typeof window !== 'undefined') {
      (window as any).lenis = lenis
    }

    // Drive Lenis from GSAP's ticker so ScrollTrigger scrub works correctly
    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const tickerFn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(tickerFn)
      lenis.destroy()
      if (typeof window !== 'undefined') {
        delete (window as any).lenis
      }
    }
  }, [])

  return <>{children}</>
}
