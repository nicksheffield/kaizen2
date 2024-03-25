import { PipTabs } from '../PipTabs'
import { ERDEditor } from '../ERDEditor'
import { ProjectSettings } from '@/components/ProjectSettings'
import { useLocalStorage } from 'usehooks-ts'
import { CodeEditor } from '@/components/FileViews/CodeEditor'

export const ProjectView = () => {
	const [tab, setTab] = useLocalStorage<'settings' | 'models' | 'json'>('project-tab', 'settings')

	return (
		<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
			<div className="flex h-10 shrink-0 items-center justify-center gap-2 border-b">
				<PipTabs
					value={tab}
					onValueChange={(val) => setTab(val)}
					items={{
						settings: 'Settings',
						models: 'Models',
						json: 'JSON',
					}}
				/>
			</div>
			{tab === 'settings' ? (
				<ProjectSettings />
			) : tab === 'models' ? (
				<ERDEditor />
			) : tab === 'json' ? (
				<CodeEditor />
			) : null}
		</div>
	)
}
