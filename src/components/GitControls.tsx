import { GitBranchIcon, GitForkIcon, PlusIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useApp } from '../lib/AppContext'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { PipTabs } from './PipTabs'
import { useMemo, useState } from 'react'

import { FsaNodeFs } from 'memfs/lib/fsa-to-node'
import type * as fsa from 'memfs/lib/fsa/types'
import { openPrompt } from '@/components/modals/openPrompt'
import { git } from '@/lib/git'

export const GitControls = () => {
	const { head, localBranches, remoteBranches, root, files } = useApp()

	const fs = useMemo(() => {
		if (!root) return null
		return new FsaNodeFs(root.handle as unknown as fsa.IFileSystemDirectoryHandle)
	}, [root])

	const [tab, setTab] = useState<'local' | 'remote'>('local')

	if (!root && !files.find((x) => x.path === '.git')) return

	return (
		<div className="flex flex-col divide-y">
			{/* <div className="h-10 flex items-center justify-between gap-2 px-2 shrink-0">
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

				<div>
					{!files.find((x) => x.path === '.git') && (
						<Button
							onClick={async () => {
								if (fs) git.init(fs)
							}}
							variant="outline"
							size="pip"
						>
							git init
						</Button>
					)}
				</div>
			</div> */}
			<div className="h-10 flex justify-between items-center pl-2 pr-2 shrink-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="pip" className="flex items-center gap-2 px-2">
							<GitForkIcon className="w-4 h-4 text-indigo-600" />
							{head}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom" align="start">
						<DropdownMenuGroup title="Local">
							<DropdownMenuLabel className="opacity-50">Local</DropdownMenuLabel>
							{localBranches.map((x) => (
								<DropdownMenuCheckboxItem
									key={x}
									checked={x === head}
									onClick={() => {
										if (fs) {
											console.log('checkout', x)
											git.checkout(fs, x)
										} else {
											console.log('no fs')
										}
									}}
								>
									{x}
								</DropdownMenuCheckboxItem>
							))}
							<DropdownMenuItem
								onClick={() => {
									openPrompt({
										label: 'Branch Name',
										onSubmit: async (val) => {
											if (fs) await git.branch(fs, val)
										},
									})
								}}
							>
								<GitBranchIcon className="w-4 h-4 mr-2" />
								New Branch
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuGroup title="Remote">
							<DropdownMenuLabel className="opacity-50">Remote</DropdownMenuLabel>
							{remoteBranches.map((x) => (
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
