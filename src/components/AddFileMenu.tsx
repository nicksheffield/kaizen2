import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useApp } from '@/lib/AppContext'
import { getEmptyProject } from '@/lib/utils'
import { PlusSquareIcon } from 'lucide-react'

export const AddFileMenu = () => {
	const { files, saveFile } = useApp()

	const projectJson = files.find((x) => x.path === 'project.json')

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="pip-icon">
					<PlusSquareIcon className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				{!projectJson && (
					<DropdownMenuItem
						onClick={() => {
							saveFile('project.json', JSON.stringify(getEmptyProject(), null, 4))
						}}
					>
						project.json
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
