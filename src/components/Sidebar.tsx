import { FilePlusIcon, FolderSearchIcon, Loader2Icon } from 'lucide-react'
import { Tree } from './Tree'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import { openConfirm } from '@/components/Alert'

export const Sidebar = () => {
	const { files, root, getRootHandle, clearRootHandle, loading } = useApp()

	const firstLevelDescs = files.filter((x) => x.path !== root?.path).filter((x) => !x.path.includes('/'))

	return (
		<div className="w-[300px] shrink-0 relative min-h-0 overflow-auto bg-muted/50 flex flex-col divide-y">
			{!root ? (
				<div className="p-4 flex flex-col">
					<Button onClick={getRootHandle} variant="default">
						{loading ? (
							<Loader2Icon className="w-4 h-4 animate-spin mr-2" />
						) : (
							<FolderSearchIcon className="w-4 h-4 mr-2" />
						)}
						Open Project
					</Button>
				</div>
			) : (
				<>
					<div className="flex flex-col flex-1">
						<div className="flex flex-row items-center justify-between h-10 border-b pl-2 pr-1">
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

									{/* <Button
										variant="ghost"
										size="pip-icon"
										onClick={() => {
											clearRootHandle()
										}}
									>
										<XIcon className="w-4 h-4" />
									</Button> */}
								</div>
							</div>

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
		</div>
	)
}
