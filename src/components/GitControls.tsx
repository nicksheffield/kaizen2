import { GitForkIcon, PanelRightOpenIcon, StarIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { PipTabs } from './PipTabs'
import { useState } from 'react'

export const GitControls = () => {
	const { head, branches, generateProject, project } = useApp()

	const [tab, setTab] = useState<'local' | 'remote'>('local')

	return (
		<div className="flex flex-col divide-y">
			<div className="h-10 flex items-center justify-between gap-2 px-2 shrink-0">
				<div className="flex items-center jusyify-between gap-2">
					<PipTabs
						value={tab}
						onValueChange={(val) => setTab(val)}
						items={{
							local: 'Local',
							remote: 'Remote',
						}}
					/>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon-sm" onClick={() => generateProject(project)}>
						<StarIcon className="w-4 h-4 opacity-50" />
					</Button>
					<Button variant="ghost" size="icon-sm">
						<PanelRightOpenIcon className="w-4 h-4 opacity-50" />
					</Button>
				</div>
			</div>
			<div className="h-10 flex justify-between items-center pl-2 pr-2 shrink-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="pip" className="flex items-center gap-2 px-2">
							<GitForkIcon className="w-4 h-4 text-indigo-600" />
							{head}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom" align="start">
						<DropdownMenuGroup title="Branches">
							<DropdownMenuLabel className="opacity-50">Branches</DropdownMenuLabel>
							{branches.map((x) => (
								<DropdownMenuCheckboxItem key={x} checked={x === head}>
									{x}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}
