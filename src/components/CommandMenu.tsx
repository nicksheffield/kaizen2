import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import { useEffect, useState } from 'react'
import { useApp } from '@/lib/AppContext'
import { openConfirm } from '@/components/Alert'

export function CommandMenu() {
	const { files, openFile, clearRootHandle } = useApp()

	const [open, setOpen] = useState(false)

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setOpen((open) => !open)
			}
		}
		document.addEventListener('keydown', down)
		return () => document.removeEventListener('keydown', down)
	}, [])

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandItem
					onSelect={() => {
						setOpen(false)
						openConfirm({
							title: 'Close this project?',
							variant: 'destructive',
							onConfirm: () => {
								clearRootHandle()
							},
						})
					}}
				>
					Close Project
				</CommandItem>
				<CommandGroup heading="Files">
					{files.map((file) => (
						<CommandItem
							key={file.path}
							onSelect={() => {
								openFile(file.path)
								setOpen(false)
							}}
						>
							{file.path}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	)
}
