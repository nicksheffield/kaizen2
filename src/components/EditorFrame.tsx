import { useApp } from '../lib/AppContext'
import { EditorTabs } from './EditorTabs'
import { CodeEditor } from './FileViews/CodeEditor'
import { JSONEditor } from './FileViews/JSONEditor'
import { ProjectView } from './FileViews/ProjectView'
import { Welcome } from './Welcome'
import { DiffView } from '@/components/FileViews/DiffView'

export const EditorFrame = () => {
	const { project, selectedPath } = useApp()

	const ext = selectedPath?.split('.').pop()

	const Editor = !selectedPath ? (
		<Welcome />
	) : selectedPath?.startsWith('diff:') ? (
		<DiffView key={selectedPath} />
	) : selectedPath === 'project.json' ? (
		<ProjectView key={project?.project.id} />
	) : ext === 'json' && !selectedPath?.startsWith('build') ? (
		<JSONEditor key={project?.project.id} />
	) : (
		<CodeEditor key={project?.project.id} />
	)

	return (
		<div className="flex flex-1 shrink flex-col relative min-h-0 min-w-0 divide-y">
			<EditorTabs />

			{Editor}
		</div>
	)
}
