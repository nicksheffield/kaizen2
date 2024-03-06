import { PipTabs } from '../PipTabs'
import { ERDEditor } from '../ERDEditor'
import { ProjectSettings } from '@/components/ProjectSettings'
import { useLocalStorage } from 'usehooks-ts'

export const ProjectView = () => {
	const [tab, setTab] = useLocalStorage<'settings' | 'env' | 'models'>('project-tab', 'settings')

	return (
		<div className="flex flex-1 flex-col relative min-h-0 overflow-hidden">
			<div className="h-10 border-b shrink-0 flex items-center justify-center gap-2">
				<PipTabs
					value={tab}
					onValueChange={(val) => setTab(val)}
					items={{
						settings: 'Settings',
						models: 'Models',
						env: 'Env',
					}}
				/>
			</div>
			{tab === 'settings' ? <ProjectSettings /> : tab === 'models' ? <ERDEditor /> : null}
		</div>
	)
}
