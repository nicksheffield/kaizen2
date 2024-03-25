import { useApp } from '../lib/AppContext'
import { EditorTabs } from './EditorTabs'
import { CodeEditor } from './FileViews/CodeEditor'
import { ReadonlyCodeView } from './FileViews/ReadonlyView'
import { ProjectView } from './FileViews/ProjectView'
import { DiffView } from './FileViews/DiffView'
import { Welcome } from './Welcome'

export const EditorFrame = () => {
	const { project, selectedPath } = useApp()

	const Editor = !selectedPath ? (
		<Welcome />
	) : selectedPath?.startsWith('diff:') ? (
		<DiffView key={selectedPath} />
	) : selectedPath === 'project.json' ? (
		<ProjectView key={project?.project.id} />
	) : selectedPath.startsWith('build') ? (
		<ReadonlyCodeView key={`${project?.project.id}-${selectedPath}`} />
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
