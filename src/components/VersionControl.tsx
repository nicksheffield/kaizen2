import Textarea from '@/components/Textarea'
import { TreeFileIcon } from '@/components/TreeFileIcon'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/AppContext'
import { isFile } from '@/lib/handle'
import { cn } from '@/lib/utils'
import { CheckIcon, PlusIcon, Undo2Icon } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'

const statusSymbol: Record<string, ReactNode> = {
	modified: <div className="text-indigo-500">M</div>,
	ignored: 'ignored',
	unmodified: 'unmodified',
	'*modified': <div className="text-indigo-500">M</div>,
	'*deleted': <div className="text-destructive">D</div>,
	'*added': <div className="text-green-500">A</div>,
	absent: <div className="text-indigo-500">M</div>,
	deleted: <div className="text-destructive">D</div>,
	added: <div className="text-green-500">A</div>,
	'*unmodified': '*unmodified',
	'*absent': '*absent',
	'*undeleted': '*undeleted',
	'*undeletemodified': '*undeletemodified',
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
		<div className="w-[300px] shrink-0 flex flex-col divide-y min-h-0 bg-muted/50">
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

			<div className="flex-1 overflow-y overflow-auto py-2 px-3">
				{changes.length > 0 && (
					<>
						<div className="px-3 py-1 text-xs font-medium opacity-50">Changes</div>
						{changes.map(([path, status]) => (
							<div
								key={path}
								className={cn(
									'px-2 group py-1 rounded-lg relative flex items-center justify-start gap-2 cursor-pointer w-full max-w-full hover:bg-foreground/10',
									selectedPath === `diff:${path}` &&
										'bg-primary text-primary-foreground hover:bg-primary/90'
								)}
								onClick={() => {
									openPath(`diff:${path}`)
								}}
							>
								<TreeFileIcon path={path} />

								<div className="text-sm truncate flex-1">
									{path.split('/').pop()}{' '}
									<span className="opacity-50">{path.split('/').slice(0, -1).join('/')}</span>
								</div>

								<div className="absolute right-0 flex flex-row mr-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
									<Button variant="secondary" size="pip-icon" className="hover:bg-muted w-5 h-5">
										<Undo2Icon className="w-3 h-3" />
									</Button>
									<Button variant="secondary" size="pip-icon" className="hover:bg-muted w-5 h-5">
										<PlusIcon className="w-3 h-3" />
									</Button>
								</div>

								<div className="text-xs text-gray-500 ml-1 justify-self-end">
									{statusSymbol[status]}
								</div>
							</div>
						))}
					</>
				)}
			</div>
		</div>
	)
}
