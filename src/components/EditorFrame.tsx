import { useApp } from '../lib/AppContext'
import { EditorTabs } from './EditorTabs'
import { CodeEditor } from './FileViews/CodeEditor'
import { JSONEditor } from './FileViews/JSONEditor'
import { ProjectView } from './FileViews/ProjectView'
import { Welcome } from './Welcome'

export const EditorFrame = () => {
	const { project, selectedFile } = useApp()

	const Editor = !selectedFile ? (
		<Welcome />
	) : selectedFile?.name === 'project.json' ? (
		<ProjectView key={project?.project.id} />
	) : selectedFile?.extension === 'json' ? (
		<JSONEditor key={project?.project.id} />
	) : (
		<CodeEditor key={project?.project.id} />
	)

	return (
		<div className="flex flex-1 flex-col relative min-h-0 divide-y">
			<EditorTabs />

			{Editor}
		</div>
	)
}
