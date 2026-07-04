import { HeroV3 } from './HeroV3'

interface HeroProps {
  onOpenModal: () => void
  onAnimationComplete?: () => void
}

export function Hero({ onOpenModal, onAnimationComplete }: HeroProps) {
  return <HeroV3 onOpenModal={onOpenModal} onAnimationComplete={onAnimationComplete} />
}
