import { useMemo, useState } from 'react'
import { useApp } from '../../lib/AppContext'
import { Button } from '../ui/button'
import { SaveIcon } from 'lucide-react'
import { MonacoEditor } from '../MonacoEditor'

export const CodeEditor = () => {
	const { selectedFile, saveFile, project } = useApp()

	const [value, setValue] = useState(selectedFile?.content || '')

	const hasChanges = useMemo(() => {
		return selectedFile?.content !== value
	}, [selectedFile, value])

	if (!selectedFile) return null

	return (
		<div className="relative flex min-h-0 flex-1 flex-col divide-y">
			<div className="flex h-10 items-center gap-3 px-4">
				<Button
					variant="pip"
					size="pip"
					onClick={() => {
						saveFile(selectedFile.path, value, { showToast: true, format: true })
					}}
					disabled={!hasChanges}
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
