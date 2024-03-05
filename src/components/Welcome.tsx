import { FlaskConicalIcon } from 'lucide-react'

export const Welcome = () => {
	return (
		<div className="h-full p-8">
			<div className="rounded-3xl border-4 border-dashed h-full flex items-center justify-center">
				{/* <div
					className="flex h-32 w-32 select-none items-center justify-center rounded-2xl bg-border px-2 font-bold text-background transition-colors"
					style={{ fontSize: '100px' }}
				>
					K
				</div> */}
				<FlaskConicalIcon className="w-32 h-32 text-border" />
			</div>
		</div>
	)
}
