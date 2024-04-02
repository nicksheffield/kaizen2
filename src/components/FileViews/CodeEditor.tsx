import { useState } from 'react'
import { useApp } from '../../lib/AppContext'
import { Button } from '../ui/button'
import { SaveIcon } from 'lucide-react'
import { MonacoEditor } from '../MonacoEditor'

export const CodeEditor = () => {
	const { selectedFile, saveFile, project } = useApp()

	const [value, setValue] = useState(selectedFile?.content || '')

	if (!selectedFile) return null

	return (
		<div className="relative flex min-h-0 flex-1 flex-col">
			<div className="absolute right-0 top-0 mr-4 mt-4">
				<Button
					variant="outline"
					onClick={() => {
						saveFile(selectedFile.path, value)
					}}
				>
					<SaveIcon className="mr-2 h-4 w-4" />
					Save
				</Button>
			</div>
			<div
				className="flex min-h-0 flex-1 flex-col overflow-auto"
				onKeyDown={(e) => {
					if (e.key === 's' && e.metaKey) {
						e.stopPropagation()
						e.preventDefault()

						saveFile(selectedFile.path, value)
					}
				}}
			>
				<MonacoEditor
					value={value}
					onValueChange={(val) => setValue(val)}
					extension={selectedFile?.extension}
					readonly={project && selectedFile.path.startsWith(project.project.devDir)}
				/>
			</div>
		</div>
	)
}
