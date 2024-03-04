import { FilePlusIcon, FolderSearchIcon, Loader2Icon } from 'lucide-react'
import { Tree } from './Tree'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import { GitControls } from './GitControls'

export const Sidebar = () => {
	const { fs, root, getRootHandle, loading } = useApp()

	const firstLevelDescs = fs.filter((x) => x.path !== root?.path).filter((x) => !x.path.includes('/'))

	return (
		<div className="w-[300px] shrink-0 relative min-h-0 overflow-auto bg-muted/50 flex flex-col divide-y">
			{root && (
				<>
					<GitControls />
					<div className="flex flex-col flex-1">
						<div className="flex flex-row items-center justify-between h-10 border-b pl-4 pr-1">
							<div className="text-sm font-medium text-muted-foreground">{root.name}</div>
							<Button variant="ghost" size="pip-icon">
								<FilePlusIcon className="w-4 h-4" />
							</Button>
						</div>
						<div className="flex flex-col flex-1 p-4">
							{firstLevelDescs.map((desc) => (
								<Tree key={desc.path} path={desc.path} />
							))}
						</div>
					</div>
				</>
			)}

			<div className="p-4 flex flex-col">
				<Button onClick={getRootHandle} variant={!root ? 'default' : 'outline'}>
					{loading ? (
						<Loader2Icon className="w-4 h-4 animate-spin mr-2" />
					) : (
						<FolderSearchIcon className="w-4 h-4 mr-2" />
					)}
					Open Project
				</Button>
			</div>
		</div>
	)
}
