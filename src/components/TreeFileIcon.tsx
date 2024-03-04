import {
	ActivityIcon,
	FileIcon,
	FileJson2Icon,
	FolderCogIcon,
	FolderGit2Icon,
	FolderIcon,
	FolderOpenIcon,
	FolderRootIcon,
	HelpCircleIcon,
} from 'lucide-react'
import { FSDesc } from '../lib/handle'
import { cn } from '@/lib/utils'

type TreeFileIconProps = {
	file?: FSDesc
	open?: boolean
}

export const TreeFileIcon = ({ file, open = true }: TreeFileIconProps) => {
	const className = cn('w-4 h-4 shrink-0', file?.type === 'directory' && 'text-primary')

	switch (file?.name) {
		case '.git':
			return <FolderGit2Icon className={className} />
		case '.vscode':
			return <FolderCogIcon className={className} />
	}

	if (file?.path === '') {
		return <FolderRootIcon className={className} />
	}

	if (file?.type === 'directory') {
		if (open) {
			return <FolderOpenIcon className={className} />
		}
		return <FolderIcon className={className} />
	}

	if (file?.type === 'file') {
		if (file?.name === 'project.json') {
			return <ActivityIcon className={className} />
		}

		const fileType = file?.name.split('.').pop()

		if (fileType === 'json') {
			return <FileJson2Icon className={className} />
		}

		return <FileIcon className={className} />
	}

	return <HelpCircleIcon className={className} />
}
