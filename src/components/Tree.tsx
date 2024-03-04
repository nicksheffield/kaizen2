import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../lib/AppContext'
import { TreeFileIcon } from './TreeFileIcon'
import { isDir, isFile } from '@/lib/handle'

type TreeProps = {
	path: string
	level?: number
}

export const Tree = ({ path, level = 0 }: TreeProps) => {
	const { fs, selectedPath, setSelectedPath, setOpenPaths, dirOpenStatus, setDirOpenStatus } = useApp()

	if (path === '.git') return null

	const open = !!dirOpenStatus[path]
	const toggleOpen = () => {
		setDirOpenStatus((y) => ({ ...y, [path]: !y[path] }))
	}

	const file = fs.find((x) => x.path === path)
	const children = fs.filter((x) => x.path !== path).filter((x) => x.path.split('/').slice(0, -1).join('/') === path)

	if (!file) return null

	return (
		<div className="flex flex-col">
			<div
				className={`py-1 rounded-lg flex items-center gap-2 cursor-pointer ${
					selectedPath === path ? 'bg-primary text-white hover:bg-primary/80' : 'hover:bg-foreground/10'
				}`}
				onClick={(e) => {
					e.stopPropagation()
					if (isFile(file)) {
						setSelectedPath(file.path)
						setOpenPaths((x) => {
							if (x.includes(path)) return x
							return [...x, path]
						})
					} else {
						toggleOpen()
					}
				}}
				style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
			>
				<TreeFileIcon file={file} open={open} />

				<div className="truncate text-sm select-none">{file.name}</div>
			</div>
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
