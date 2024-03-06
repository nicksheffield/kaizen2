import { useApp } from '@/lib/AppContext'

export const ReadonlyView = () => {
	const { selectedFile } = useApp()

	if (!selectedFile) return null

	return (
		<div className="flex flex-1 flex-col relative min-h-0 overflow-auto p-4">
			<pre className="text-sm">{selectedFile?.content || ''}</pre>
		</div>
	)
}
