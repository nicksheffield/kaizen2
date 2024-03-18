import { useApp } from '@/lib/AppContext'
import { Project } from '@/Project'
import { FolderSearchIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

export const App = () => {
	const { root, getRootHandle, loading } = useApp()

	return <Project />

	if (root) return <Project />

	return (
		<div className="w-screen h-screen flex items-center justify-center gap-2 flex-col">
			<Logo />
			<Button onClick={getRootHandle} variant="default">
				{loading ? (
					<Loader2Icon className="w-4 h-4 animate-spin mr-2" />
				) : (
					<FolderSearchIcon className="w-4 h-4 mr-2" />
				)}
				Open Project
			</Button>
		</div>
	)
}
