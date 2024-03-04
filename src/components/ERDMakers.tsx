// https://reactflow.dev/docs/examples/edges/markers/

export const ERDMarkers = () => {
	return (
		<svg
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: 0,
				height: 0,
			}}
		>
			<defs>
				<marker
					id="hasMany"
					viewBox="0 0 20 20"
					markerHeight={10}
					markerWidth={10}
					refX={8}
					refY={10}
					orient="auto-start-reverse"
				>
					{(() => {
						const h = 20
						const w = 20

						// match this with globals.css -> .react-flow .react-flow__edge-path
						return (
							<g className="stroke-ring dark:stroke-foreground">
								<line
									x1={0}
									y1={h / 2}
									x2={w - 3}
									y2={1}
									strokeWidth="2"
								/>
								<line
									x1={0}
									y1={h / 2}
									x2={w - 3}
									y2={h / 2}
									strokeWidth="2"
								/>
								<line
									x1={0}
									y1={h / 2}
									x2={w - 3}
									y2={h - 1}
									strokeWidth="2"
								/>
							</g>
						)
					})()}
				</marker>

				<marker
					id="hasOne"
					viewBox="0 0 20 20"
					markerHeight={10}
					markerWidth={10}
					refX={10}
					refY={10}
					orient="auto-start-reverse"
				>
					{(() => {
						const h = 20
						const w = 20

						// match this with globals.css -> .react-flow .react-flow__edge-path
						return (
							<g className="stroke-ring dark:stroke-foreground">
								<line
									x1={w / 3}
									y1={0}
									x2={w / 3}
									y2={h}
									strokeWidth="2"
								/>
								<line
									x1={0}
									y1={h / 2}
									x2={w}
									y2={h / 2}
									strokeWidth="2"
								/>
							</g>
						)
					})()}
				</marker>
			</defs>
		</svg>
	)
}
