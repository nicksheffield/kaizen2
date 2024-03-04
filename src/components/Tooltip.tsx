import { type ReactNode } from 'react'
import { Tooltip as TooltipUI, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

type TooltipProps = {
	children: ReactNode
	content: ReactNode
	side?: 'top' | 'bottom' | 'left' | 'right'
	delayDuration?: number
}

export const Tooltip = ({ children, content, side, delayDuration }: TooltipProps) => {
	return (
		<TooltipUI delayDuration={delayDuration}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side={side} className="pointer-events-none select-none">
				{content}
			</TooltipContent>
		</TooltipUI>
	)
}
