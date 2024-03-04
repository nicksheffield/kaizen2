import deepEqual from 'deep-equal'
import { useEffect, useState } from 'react'
import { useApp } from '../../lib/AppContext'
import { Button } from '../ui/button'
import { SaveIcon } from 'lucide-react'
import { MonacoEditor } from '../MonacoEditor'

export const CodeEditor = () => {
	const { selectedFile, saveFile } = useApp()

	const [dirty, setDirty] = useState(false)

	const [value, setValue] = useState(selectedFile?.content || '')

	const hasChanges = !deepEqual(selectedFile?.content, value)

	useEffect(() => {
		if (!selectedFile) return
		if (hasChanges && !dirty) setValue(selectedFile.content)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasChanges, dirty])

	if (!selectedFile) return null

	return (
		<div className="flex flex-1 flex-col relative min-h-0">
			<div className="absolute top-0 right-0 mr-4 mt-4">
				<Button
					variant="outline"
					onClick={() => {
						saveFile(selectedFile.path, value)
						setDirty(false)
					}}
				>
					<SaveIcon className="w-4 h-4 mr-2" />
					Save
				</Button>
			</div>
			<div
				className="flex-1 min-h-0 overflow-auto flex flex-col"
				onKeyDown={(e) => {
					if (e.key === 's' && e.metaKey) {
						e.stopPropagation()
						e.preventDefault()

						saveFile(selectedFile.path, value)
						setDirty(false)
					}
				}}
			>
				<MonacoEditor
					value={value}
					onValueChange={(val) => setValue(val)}
					extension={selectedFile?.extension}
				/>
			</div>
		</div>
	)
}
