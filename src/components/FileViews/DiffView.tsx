import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { useTheme } from '@/lib/ThemeContext'
import { isFile } from '@/lib/handle'
import { useEffect, useState } from 'react'
import ReactDiffViewer from 'react-diff-viewer'

export const DiffView = () => {
	const { root, files, selectedPath, git } = useApp()

	const { theme } = useTheme()

	const selectedFile = files.filter(isFile).find((x) => x.path === selectedPath?.replace('diff:', ''))

	const [original, setOriginal] = useState<string | undefined>(undefined)

	useEffect(() => {
		const main = async () => {
			if (!root?.handle || !selectedFile) return

			const logs = (await git?.log()) || []

			const commit = await git?.readCommit(logs[0]?.oid, selectedFile.path)

			const originalContent = new TextDecoder().decode(commit?.object as Uint8Array)
			setOriginal(originalContent)
		}

		main()
	}, [root, selectedFile])

	return (
		<ScrollArea style={{ zoom: 0.8 }} className="min-h-0 overflow-auto">
			{original !== undefined ? (
				<ReactDiffViewer
					oldValue={original}
					newValue={selectedFile?.content}
					splitView={true}
					useDarkTheme={theme === 'dark'}
					styles={{
						variables: {
							dark: {
								diffViewerBackground: '#020817',
								diffViewerColor: '#FFF',
								addedBackground: '#047857',
								addedColor: 'white',
								removedBackground: '#632F34',
								removedColor: 'white',
								wordAddedBackground: '#055d67',
								wordRemovedBackground: '#7d383f',
								addedGutterBackground: '#034148',
								removedGutterBackground: '#632b30',
								gutterBackground: '#0f1829',
								gutterBackgroundDark: '#262933',
								highlightBackground: '#2a3967',
								highlightGutterBackground: '#2d4077',
								codeFoldGutterBackground: '#0f1829',
								codeFoldBackground: '#0f1829',
								emptyLineBackground: '#0f1829',
								gutterColor: '#464c67',
								addedGutterColor: '#8c8c8c',
								removedGutterColor: '#8c8c8c',
								codeFoldContentColor: '#555a7b',
								diffViewerTitleBackground: '#2f323e',
								diffViewerTitleColor: '#555a7b',
								diffViewerTitleBorderColor: '#353846',
							},
						},
					}}
				/>
			) : // <div className="flex justify-center p-8">
			// 	<Loader2Icon className="w-8 h-8 animate-spin" />
			// </div>
			null}
		</ScrollArea>
	)
}
