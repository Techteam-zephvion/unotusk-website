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

  return (
    <>
      <Navigation onOpenModal={() => setIsModalOpen(true)} />
      <main>
        <Hero onOpenModal={() => setIsModalOpen(true)} />
        <Problem />
        <What />
        <CTA onOpenModal={() => setIsModalOpen(true)} />
      </main>
      <Footer />
      <EarlyAccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
