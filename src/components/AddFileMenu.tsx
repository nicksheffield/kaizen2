import { openPrompt } from '@/components/modals/openPrompt'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useApp } from '@/lib/AppContext'
import { getEmptyProject } from '@/lib/utils'
import { PlusCircleIcon, PlusSquareIcon } from 'lucide-react'

export const AddFileMenu = () => {
	const { files, saveFile, openPath } = useApp()

	const projectJson = files.find((x) => x.path === 'project.json')

	if (!projectJson) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="pip-icon"
						onClick={() => {
							saveFile('project.json', JSON.stringify(getEmptyProject(), null, 4))
						}}
					>
						<PlusCircleIcon className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Create Project</TooltipContent>
			</Tooltip>
		)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="pip-icon">
					<PlusSquareIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuItem
					onClick={() => {
						openPrompt({
							label: 'Endpoint path',
							onSubmit: async (val) => {
								let path = val

								if (val.startsWith('/')) path = path.slice(1)
								if (val.startsWith('api/')) path = path.slice(4)

								await saveFile(`api/${path}.json`, '{}')
								openPath(`api/${path}.json`)
							},
						})
					}}
				>
					Add Endpoint
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
