import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

type RevealButton = {
	onClick: () => void
	icon: ReactNode
	label: string
	revealLabel?: string
}

export const RevealButton = ({ onClick, icon, label, revealLabel }: RevealButton) => {
	const [hovered, setHovered] = useState(false)

	return (
		<Button
			variant="ghost"
			size="pip"
			className={cn('rounded-full px-2', revealLabel && 'bg-green-500')}
			onMouseOver={() => setHovered(true)}
			onMouseOut={() => setHovered(false)}
			onClick={onClick}
		>
			{icon}
			<AnimatePresence>
				{(hovered || revealLabel) && (
					<motion.div
						initial={{ width: 0 }}
						exit={{ width: 0 }}
						animate={{ width: 'auto' }}
						className="overflow-hidden rounded-full"
					>
						<div className="pl-2">{revealLabel || label}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</Button>
	)
}
