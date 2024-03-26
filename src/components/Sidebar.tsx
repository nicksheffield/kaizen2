import { AlertOctagonIcon, AlertTriangleIcon, FolderSearchIcon, Loader2Icon, RefreshCcwDotIcon } from 'lucide-react'
import { Tree } from './Tree'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import { openConfirm } from '@/components/Alert'
import { AddFileMenu } from '@/components/AddFileMenu'
import { ScrollArea } from '@/components/ui/scroll-area'
import pluralize from 'pluralize'

export const Sidebar = () => {
	const {
		files,
		root,
		getRootHandle,
		clearRootHandle,
		loading,
		generateProject,
		project,
		buildErrorPaths,
		selectedPath,
		setSelectedPath,
		setOpenPaths,
	} = useApp()

	const firstLevelDescs = files.filter((x) => x.path !== root?.path).filter((x) => !x.path.includes('/'))

	return (
		<div className="relative flex min-h-0 flex-1 flex-col divide-y bg-muted/50">
			{!root ? (
				<div className="flex flex-col p-4">
					<Button onClick={getRootHandle} variant="default">
						{loading ? (
							<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<FolderSearchIcon className="mr-2 h-4 w-4" />
						)}
						Open Project
					</Button>
				</div>
			) : (
				<>
					<div className="flex min-h-0 flex-1 flex-col divide-y">
						<div className="flex h-10 shrink-0 flex-row items-center justify-between pl-2 pr-1">
							<div>
								<div className="flex items-center gap-2">
									<Button
										variant="pip"
										className="text-sm font-medium text-muted-foreground"
										onClick={() => {
											openConfirm({
												title: 'Close this project?',
												variant: 'destructive',
												onConfirm: () => {
													clearRootHandle()
												},
											})
										}}
									>
										{root.name}
									</Button>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Button variant="ghost" size="pip-icon" onClick={() => generateProject(project)}>
									<RefreshCcwDotIcon className="h-4 w-4" />
								</Button>
								<AddFileMenu />
							</div>
						</div>
						{buildErrorPaths.length > 0 && (
							<div className="p-2">
								<Button
									variant="destructive"
									className="w-full"
									onClick={() => {
										const nextIndex =
											(buildErrorPaths.indexOf(selectedPath || '') + 1) % buildErrorPaths.length
										setOpenPaths((o) =>
											[...o, buildErrorPaths[nextIndex]].filter((x, i, a) => a.indexOf(x) === i)
										)
										setSelectedPath(buildErrorPaths[nextIndex])
									}}
								>
									<AlertOctagonIcon className="mr-2 w-5" />
									There {buildErrorPaths.length === 1 ? 'is' : 'are'} {buildErrorPaths.length}{' '}
									{pluralize('file', buildErrorPaths.length)} with build errors
								</Button>
							</div>
						)}
						<ScrollArea className="flex flex-1 flex-col overflow-auto" orientation="vertical">
							<div className="flex flex-1 flex-col p-2">
								{firstLevelDescs.map((desc) => (
									<Tree key={desc.path} path={desc.path} />
								))}
							</div>
						</ScrollArea>
					</div>
				</>
			)}
		</div>
	)
}
