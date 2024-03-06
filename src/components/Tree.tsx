import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../lib/AppContext'
import { TreeFileIcon } from './TreeFileIcon'
import { FSDesc, isDir, isFile } from '@/lib/handle'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Trash2Icon } from 'lucide-react'
import { openConfirm } from '@/components/Alert'

type TreeProps = {
	path: string
	level?: number
}

export const Tree = ({ path, level = 0 }: TreeProps) => {
	const { files, selectedPath, openPath, dirOpenStatus, setDirOpenStatus, deleteFile } = useApp()

	// if (path === '.git') return null

	const open = !!dirOpenStatus[path]
	const toggleOpen = () => {
		setDirOpenStatus((y) => ({ ...y, [path]: !y[path] }))
	}

	const file = files.find((x) => x.path === path)
	const children = files
		.filter((x) => x.path !== path)
		.filter((x) => x.path.split('/').slice(0, -1).join('/') === path)

	if (!file) return null

	return (
		<div className="flex flex-col">
			<DescRow
				file={file}
				isSelected={selectedPath === path}
				onSelect={() => {
					if (isFile(file)) {
						openPath(file.path)
					} else {
						toggleOpen()
					}
				}}
				onDelete={async () => {
					await deleteFile(file)
				}}
				level={level}
				isOpen={open}
			/>
			{isDir(file) && (
				<AnimatePresence initial={false}>
					{open && (
						<motion.div
							initial={{ height: 0 }}
							exit={{ height: 0 }}
							animate={{ height: 'auto' }}
							className="overflow-hidden"
						>
							{children.map((file) => (
								<div key={file.path}>
									<Tree path={file.path} level={level + 1} />
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</div>
	)
}

type DescRowProps = {
	file: FSDesc
	isSelected: boolean
	onSelect: () => Promise<void> | void
	onDelete: () => Promise<void> | void
	level?: number
	isOpen: boolean
}

const DescRow = ({ file, isSelected, onSelect, onDelete, level = 1, isOpen }: DescRowProps) => {
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className={`py-1 rounded-lg flex items-center gap-2 cursor-pointer ${
						isSelected ? 'bg-primary text-white hover:bg-primary/80' : 'hover:bg-foreground/10'
					}`}
					onClick={(e) => {
						e.stopPropagation()
						onSelect()
					}}
					style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
				>
					<TreeFileIcon path={file.path} open={isOpen} />

					<div className="truncate text-sm select-none">{file.name}</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem
					className="focus:bg-destructive text-destructive focus:text-destructive-foreground"
					onClick={() => {
						openConfirm({
							title: 'Delete file?',
							variant: 'destructive',
							onConfirm: async () => {
								await onDelete()
							},
						})
					}}
				>
					<Trash2Icon className="w-4 mr-2" />
					Delete {isFile(file) ? 'File' : 'Directory'}
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
