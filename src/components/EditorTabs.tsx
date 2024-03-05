import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TreeFileIcon } from './TreeFileIcon'
import { useApp } from '../lib/AppContext'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'

export const EditorTabs = () => {
	const { files, setDirOpenStatus, openPaths, setOpenPaths, selectedPath, setSelectedPath } = useApp()

	const getFile = (path: string) => files.find((x) => x.path === path)

	const openFile = (path: string) => {
		setSelectedPath(path)

		setDirOpenStatus((y) => {
			const parts = path
				.split('/')
				.slice(0, -1)
				.map((x, i, a) => (i === 0 ? x : a.slice(0, i + 1).join('/')))

			const opens = parts.reduce<Record<string, boolean>>((acc, part) => ({ ...acc, [part]: true }), {})

			return { ...y, ...opens }
		})
	}

	const closePath = (path: string) => {
		setOpenPaths((y) => y.filter((z) => z !== path))
		if (selectedPath === path) {
			const index = openPaths.indexOf(path)
			setSelectedPath(openPaths.length === 1 ? undefined : index - 1 >= 0 ? openPaths[index - 1] : openPaths[0])
		}
	}

	return (
		<div className="h-10 flex max-w-full">
			{openPaths.map((x, i) => (
				<ContextMenu key={x}>
					<ContextMenuTrigger asChild>
						<div
							className={cn(
								'hover:bg-muted group flex items-center gap-2 pr-2 pl-4 justify-center text-sm font-medium cursor-pointer select-none',
								x === selectedPath &&
									'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-600/20 dark:text-blue-300'
							)}
							onClick={() => openFile(x)}
						>
							<TreeFileIcon file={getFile(x)} />
							<div className="truncate">{x.split('/').slice(-1)}</div>
							<div
								onClick={(e) => {
									e.stopPropagation()
									closePath(x)
								}}
								className={cn(
									'pointer-events-none opacity-0 group-hover:opacity-50 group-hover:pointer-events-auto group-hover:hover:opacity-100'
								)}
							>
								<XIcon className="w-4 h-4" />
							</div>
						</div>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuItem
							onClick={() => {
								closePath(x)
							}}
						>
							Close
						</ContextMenuItem>

						<ContextMenuItem
							onClick={() => {
								setOpenPaths([x])
								setSelectedPath(x)
							}}
						>
							Close others
						</ContextMenuItem>

						<ContextMenuItem
							onClick={() => {
								const newOpenPaths = openPaths.slice(0, i + 1)
								setOpenPaths(newOpenPaths)

								if (!selectedPath) return

								// string /// can never happen
								if (newOpenPaths.indexOf(selectedPath) === -1) {
									setSelectedPath(newOpenPaths[newOpenPaths.length - 1])
								}
							}}
						>
							Close to the right
						</ContextMenuItem>

						<ContextMenuItem
							onClick={() => {
								setOpenPaths([])
								setSelectedPath(undefined)
							}}
						>
							Close all
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
			))}
		</div>
	)
}
