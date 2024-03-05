import { GitControls } from '@/components/GitControls'

export const StatusBar = () => {
	return (
		<div className="h-10 border-t bg-muted/50">
			<GitControls />
		</div>
	)
}
