import { HeroV3 } from './HeroV3'

interface HeroProps {
  onOpenModal: () => void
}

export function Hero({ onOpenModal }: HeroProps) {
  return <HeroV3 onOpenModal={onOpenModal} />
}
