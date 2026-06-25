import { Navigation } from '@/features/navigation'
import { Hero } from '@/features/hero'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        {/* Further sections pending Hero approval */}
      </main>
    </>
  )
}
