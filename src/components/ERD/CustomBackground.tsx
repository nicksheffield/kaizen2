import { cn } from '@/lib/utils'

type DotPatternProps = {
	radius: number
	className?: string
}

export function DotPattern({ radius, className }: DotPatternProps) {
	return <circle cx={radius} cy={radius} r={radius} color={'rgba(128,128,128,0.1)'} className={cn(className)} />
}

import { CSSProperties, memo, useRef } from 'react'
import { shallow } from 'zustand/shallow'

import { ReactFlowState, useStore } from 'reactflow'

export type BackgroundProps = {
	gap?: number | [number, number]
	size?: number
	offset?: number
	style?: CSSProperties
	className?: string
}

const selector = (s: ReactFlowState) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` })

const containerStyle: CSSProperties = {
	position: 'absolute',
	width: '100%',
	height: '100%',
	top: 0,
	left: 0,
}

function BackgroundComponent({ gap = 20, size, offset = 2, style, className }: BackgroundProps) {
	const ref = useRef<SVGSVGElement>(null)
	const { transform, patternId } = useStore(selector, shallow)
	const patternSize = size || 1
	const gapXY: [number, number] = Array.isArray(gap) ? gap : [gap, gap]
	const scaledGap: [number, number] = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1]
	const scaledSize = patternSize * transform[2]

	const patternOffset = [(gapXY[0] + patternSize) / 2, (gapXY[1] + patternSize) / 2]

	return (
		<svg className={cn(['bg-transparent', className])} style={{ ...style, ...containerStyle }} ref={ref}>
			<pattern
				id={patternId}
				x={transform[0] % scaledGap[0]}
				y={transform[1] % scaledGap[1]}
				width={scaledGap[0]}
				height={scaledGap[1]}
				patternUnits="userSpaceOnUse"
				patternTransform={`translate(-${patternOffset[0]},-${patternOffset[1]})`}
			>
				<DotPattern radius={scaledSize / offset} className={'fill-foreground/5'} />
			</pattern>
			<rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
		</svg>
	)
}

BackgroundComponent.displayName = 'CustomBackground'

export const CustomBackground = memo(BackgroundComponent)
