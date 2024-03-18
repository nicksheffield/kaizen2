'use client'

import { Ripples } from './Ripples'

export const Logo = () => (
	<div className="relative group">
		<div className="flex h-8 w-8 select-none items-center rounded-md bg-muted px-2 text-2xl font-bold text-foreground transition-colors hover:bg-primary hover:text-light">
			K
		</div>
		<div className="absolute top-0 left-0 translate-x-[-47.6%] translate-y-[-47.6%] -z-[1] pointer-events-none">
			<Ripples />
		</div>
	</div>
)
