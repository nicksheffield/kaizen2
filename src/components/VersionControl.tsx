import Textarea from '@/components/Textarea'
import { TreeFileIcon } from '@/components/TreeFileIcon'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { isFile } from '@/lib/handle'
import { cn } from '@/lib/utils'
import { CheckIcon, PlusIcon, Undo2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

const StatusSymbol = ({ status, className }: { status: string; className: string }) => {
	const symbol = statusSymbol[status]

	if (!symbol) return <span className={cn(className)}>?</span>

	return <span className={cn(symbol[0], className)}>{symbol[1]}</span>
}

const statusSymbol: Record<string, [string, string]> = {
	modified: ['text-indigo-500', 'M'],
	ignored: ['text-grey-500', '?'],
	unmodified: ['text-grey-500', '?'],
	'*modified': ['text-indigo-500', 'M'],
	'*deleted': ['text-red-500', 'D'],
	'*added': ['text-orange-500', 'A'],
	absent: ['text-grey-500', '?'],
	deleted: ['text-red-500', 'D'],
	added: ['text-orange-500', 'A'],
	'*unmodified': ['text-grey-500', '?'],
	'*absent': ['text-grey-500', '?'],
	'*undeleted': ['text-grey-500', '?'],
	'*undeletemodified': ['text-grey-500', '?'],
} as const

export const VersionControl = () => {
	const { git, files, root, openPath, selectedPath } = useApp()
	const [diff, setDiff] = useState<Record<string, string>>({})
	const [commitMsg, setCommitMsg] = useState('')

	const isFileUnimportant = (status: string) => {
		return status === 'unmodified' || status === 'ignored'
	}

	// const createCommit = async () => {
	// 	if (!git) return

	// 	const fileDescs = files.filter(isFile).filter((x) => !x.path.startsWith('.git'))

	// 	const fileStatuses: Record<string, GitFileStatus> = {}

	// 	for (const file of fileDescs) {
	// 		const status = await git.status(file.path)

	// 		if (!status) continue
	// 		fileStatuses[file.path] = status
	// 	}

	// 	setCommitMsg('')
	// }

	useEffect(() => {
		if (!git) return

		const main = async () => {
			const fileDescs = files.filter(isFile).filter((x) => !x.path.startsWith('.git'))

			const diffs: Record<string, string> = {}

			for (const file of fileDescs) {
				const status = await git.status(file.path)

				if (!status) continue
				// if (file.path.startsWith('build')) continue
				diffs[file.path] = status
			}

			setDiff(diffs)
		}

		main()
	}, [files])

	const changes = Object.entries(diff).filter(([, status]) => !isFileUnimportant(status))

	if (!root) return <div></div>

	return (
		<div className="flex-1 shrink-0 flex flex-col divide-y min-h-0 min-w-0 bg-muted/50">
			{/* <div className="px-2 h-10 shrink-0 flex items-center">
				<div className="text-sm font-medium opacity-50">Version Control</div>
			</div> */}
			<div className="px-2 py-2 shrink-0 flex flex-col gap-2">
				<Textarea value={commitMsg} onValueChange={setCommitMsg} placeholder="Commit Message..." />

				<Button variant="secondary" size="sm">
					<CheckIcon className="w-4 h-4 mr-2" />
					Commit
				</Button>
			</div>

			<ScrollArea className="flex-1 overflow-auto flex flex-col min-w-0">
				<div className="p-2 flex flex-col min-w-0 flex-1">
					{changes.length > 0 && (
						<>
							<div className="px-3 py-1 text-xs font-medium opacity-50">Changes</div>
							{changes.map(([path, status]) => (
								<div
									key={path}
									className={cn(
										'px-2 group h-7 rounded-lg relative gap-2 cursor-pointer min-w-0 hover:bg-foreground/10 flex items-center w-[calc(300px-(4*0.25rem))]',
										selectedPath === `diff:${path}` &&
											'bg-primary text-primary-foreground hover:bg-primary/90'
									)}
									onClick={() => {
										openPath(`diff:${path}`)
									}}
								>
									<TreeFileIcon path={path} />

									<div className="truncate flex-1 align-baseline">
										<span className="text-sm">{path.split('/').pop()} </span>
										<span className="opacity-50 text-xs">
											{path.split('/').slice(0, -1).join('/')}
										</span>
									</div>

									<div className="flex-row opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hidden group-hover:flex">
										<Button
											variant="secondary"
											size="pip-icon"
											className={cn(
												'bg-transparent hover:bg-foreground/10 w-5 h-5',
												selectedPath === `diff:${path}` && 'text-light'
											)}
										>
											<Undo2Icon className="w-4 h-4" />
										</Button>
										<Button
											variant="secondary"
											size="pip-icon"
											className={cn(
												'bg-transparent hover:bg-foreground/10 w-5 h-5',
												selectedPath === `diff:${path}` && 'text-light'
											)}
										>
											<PlusIcon className="w-4 h-4" />
										</Button>
									</div>

									<span className="text-xs text-gray-500 w-4 text-center justify-self-end">
										<StatusSymbol
											status={status}
											className={cn(selectedPath === `diff:${path}` && 'text-light')}
										/>
									</span>
								</div>
							))}
						</>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}
