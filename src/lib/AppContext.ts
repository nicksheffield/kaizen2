import { createContext, useContext } from 'react'
import { DirDesc, FileDesc, FSDesc } from './handle'
import { Project } from '@/lib/schemas'

export type AppContextType = {
	fs: FSDesc[]
	setFs: React.Dispatch<React.SetStateAction<FSDesc[]>>
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	openPaths: string[]
	setOpenPaths: React.Dispatch<React.SetStateAction<string[]>>
	dirOpenStatus: Record<string, boolean>
	setDirOpenStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
	selectedPath: string | undefined
	setSelectedPath: React.Dispatch<React.SetStateAction<string | undefined>>
	hasNewChanges: boolean
	setHasNewChanges: React.Dispatch<React.SetStateAction<boolean>>

	head: string
	branches: string[]
	selectedFile: FileDesc | undefined
	root: DirDesc | undefined

	project?: Project
	saveProject: (project: Project) => Promise<void>
	generateProject: (project?: Project) => void
	draft?: {
		dirty: boolean
		content: Project
	}
	setDraft: React.Dispatch<
		React.SetStateAction<
			| {
					dirty: boolean
					content: Project
			  }
			| undefined
		>
	>

	getRootHandle: () => Promise<void>
	refreshFiles: () => Promise<void>
	saveFile: (path: string, content: string) => Promise<void>
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

export const useApp = () => useContext(AppContext)
