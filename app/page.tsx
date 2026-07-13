'use client'

import { useState } from 'react'
import { Navigation } from '@/features/navigation'
import { Hero } from '@/features/hero'
import { Problem } from '@/features/problem'
import { What } from '@/features/what'
import { CTA } from '@/features/cta'
import { Footer } from '@/features/footer'
import { EarlyAccessModal } from '@/components/EarlyAccessModal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialAnimDone, setInitialAnimDone] = useState(false)

  return (
    <>
      <Navigation onOpenModal={() => setIsModalOpen(true)} initialAnimDone={initialAnimDone} />
      <main>
        <Hero onOpenModal={() => setIsModalOpen(true)} onAnimationComplete={() => setInitialAnimDone(true)} />
        <Problem />
        <What />
        <CTA onOpenModal={() => setIsModalOpen(true)} />
        <Footer />
      </main>
      <EarlyAccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
