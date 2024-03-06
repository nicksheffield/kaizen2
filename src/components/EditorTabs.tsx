import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TreeFileIcon } from './TreeFileIcon'
import { useApp } from '../lib/AppContext'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable'
import { restrictToHorizontalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export const EditorTabs = () => {
	const { openPaths, setOpenPaths } = useApp()

	const sensors = useSensors(
		useSensor(PointerSensor, {
			// https://github.com/clauderic/dnd-kit/issues/893#issuecomment-1380691454
			activationConstraint: {
				// Require pointer to move by 5 pixels before activating draggable
				// Allows nested onClicks/buttons/interactions to be accessed
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		const oldIndex = openPaths.findIndex((x) => x === active.id)
		const newIndex = openPaths.findIndex((x) => x === over?.id)

		setOpenPaths(arrayMove([...openPaths], oldIndex, newIndex))
	}

	const holderRef = useRef<HTMLDivElement>(null)
	const [prevOpenPaths, setPrevOpenPaths] = useState<string[]>(openPaths)

	useEffect(() => {
		if (!holderRef.current) return

		if (prevOpenPaths.length < openPaths.length) {
			holderRef.current?.scrollTo({ left: holderRef.current.scrollWidth, behavior: 'instant' })
		}

		setPrevOpenPaths(openPaths)
	}, [openPaths])

	const onSelect = (node: HTMLDivElement) => {
		if (!holderRef.current) return

		const bounds = node.getBoundingClientRect()

		// if node is to the left of the scroll area
		if (node.offsetLeft < holderRef.current.scrollLeft) {
			holderRef.current.scrollTo({ left: node.offsetLeft, behavior: 'instant' })
		}

		// if node is to the right of the scroll area
		if (node.offsetLeft + bounds.width > holderRef.current.scrollLeft + holderRef.current.clientWidth) {
			holderRef.current.scrollTo({
				left: node.offsetLeft - holderRef.current.clientWidth + bounds.width,
				behavior: 'instant',
			})
		}
	}

	return (
		<ScrollArea className="w-full shrink-0" orientation="horizontal" ref={holderRef}>
			<div className="h-10 flex max-w-full w-full">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
					modifiers={[restrictToFirstScrollableAncestor, restrictToHorizontalAxis]}
				>
					<SortableContext items={openPaths} strategy={horizontalListSortingStrategy}>
						{openPaths.map((x, i) => (
							<FileTab key={x} filePath={x} index={i} onSelect={onSelect} />
						))}
					</SortableContext>
				</DndContext>
			</div>
		</ScrollArea>
	)
}

type FileTabProps = {
	filePath: string
	index: number
	onSelect: (node: HTMLDivElement) => void
}

const FileTab = ({ filePath, index, onSelect }: FileTabProps) => {
	const { setDirOpenStatus, openPaths, setOpenPaths, selectedPath, setSelectedPath } = useApp()

	const nodeRef = useRef<HTMLDivElement | null>(null)

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: filePath })

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

	const style = {
		transform: CSS.Transform.toString(transform ? { ...transform, scaleX: 1 } : null),
		transition,
	}

	const postProtocol = filePath.split(':')[1] || filePath
	const fileName = postProtocol.split('/').slice(-1)[0]
	const hasProtocol = filePath.includes(':')
	const protocol = hasProtocol ? filePath.split(':')[0] : ''

	const name = `${protocol}${hasProtocol ? ':' : ''}${fileName}`

	// handle auto scrolling to tab when it becomes selected
	const [prevSelected, setPrevSelected] = useState(selectedPath === filePath)

	useEffect(() => {
		if (!prevSelected && selectedPath === filePath) {
			if (nodeRef.current) onSelect(nodeRef.current)
			setPrevSelected(true)
		} else if (prevSelected) {
			setPrevSelected(false)
		}
	}, [selectedPath])

	return (
		<ContextMenu key={filePath}>
			<ContextMenuTrigger>
				<div
					style={style}
					ref={(node) => {
						setNodeRef(node)
						nodeRef.current = node
					}}
					className={cn('relative h-full', isDragging && 'z-20 cursor-grabbing')}
					onClick={() => {
						openFile(filePath)
						if (nodeRef.current) onSelect(nodeRef.current)
					}}
				>
					<div
						className={cn(
							'hover:bg-muted group flex items-center gap-2 pr-2 pl-4 justify-center text-sm font-medium cursor-pointer select-none h-full',
							filePath === selectedPath &&
								'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-600/20 dark:text-blue-300'
						)}
					>
						<div {...attributes} {...listeners} className="flex items-center gap-2">
							<TreeFileIcon path={filePath} />
							<div className="truncate">{name}</div>
						</div>

						<div
							onClick={(e) => {
								e.stopPropagation()
								closePath(filePath)
							}}
							className={cn(
								'pointer-events-none opacity-0 group-hover:opacity-50 group-hover:pointer-events-auto group-hover:hover:opacity-100'
							)}
						>
							<XIcon className="w-4 h-4" />
						</div>
					</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem
					onClick={() => {
						closePath(filePath)
					}}
				>
					Close
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => {
						setOpenPaths([filePath])
						setSelectedPath(filePath)
					}}
				>
					Close others
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => {
						const newOpenPaths = openPaths.slice(0, index + 1)
						setOpenPaths(newOpenPaths)

						if (!selectedPath) return

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
	)
}
