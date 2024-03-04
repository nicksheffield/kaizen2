import { useState } from 'react'
import { PipTabs } from '../PipTabs'
import { ERDEditor } from '../ERDEditor'
import { ProjectSettings } from '@/components/ProjectSettings'

export const ProjectView = () => {
	const [tab, setTab] = useState<'settings' | 'env' | 'models'>('settings')

	return (
		<div className="flex flex-1 flex-col relative min-h-0 overflow-hidden">
			<div className="h-10 border-b shrink-0 flex items-center justify-center gap-2 shadow-lg">
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
