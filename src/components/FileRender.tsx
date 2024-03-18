// import { z } from 'zod'
import { FileDesc } from '../lib/handle'
import { useEffect, useRef, useState } from 'react'
import { SaveIcon, XIcon } from 'lucide-react'
import deepEqual from 'deep-equal'
import { cn } from '@/lib/utils'
import { Input } from './ui/input'
import { Button } from './ui/button'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import { useTheme } from '../lib/ThemeContext'
import { Welcome } from './Welcome'
import { TreeFileIcon } from './TreeFileIcon'
import { AppContextType, useApp } from '../lib/AppContext'

const readable: Record<string, string> = {
	name: 'Name',
	repoUrl: 'Repo Url',
	domainName: 'Domain Name',
	maxBodySize: 'Max Body Size',
	connectionTimeout: 'Connection Timeout',
}

const monacoLang: Record<string, string> = {
	json: 'json',
	js: 'javascript',
	ts: 'typescript',
	html: 'html',
	css: 'css',
	scss: 'scss',
	md: 'markdown',
}

type FileRenderProps = {
	file: FileDesc
	onContentChange: (content: string) => Promise<void> | void
	openPaths: AppContextType['openPaths']
	setOpenPaths: AppContextType['setOpenPaths']
	selectedPath: AppContextType['selectedPath']
	setSelectedPath: AppContextType['setSelectedPath']
}

export const FileRender = (props: FileRenderProps) => {
	const { file, openPaths, setOpenPaths, selectedPath, setSelectedPath } = props

	const { setDirOpenStatus } = useApp()

	const openFile = (path: string) => {
		setSelectedPath(path)

		setDirOpenStatus((y) => {
			const parts = path
				.split('/')
				.slice(0, -1)
				.map((x, i, a) => (i === 0 ? x : a.slice(0, i + 1).join('/')))

			const opens = parts.reduce<Record<string, boolean>>((acc, part) => ({ ...acc, [part]: true }), {})

			return { ...y, ...opens }
		})
	}

	return (
		<div className="flex flex-1 flex-col relative min-h-0 divide-y">
			<div className="h-10 flex shrink-0">
				{openPaths.map((x) => (
					<div
						key={x}
						className={cn(
							'hover:bg-muted group flex items-center gap-2 pr-2 pl-4 justify-center text-sm font-medium cursor-pointer select-none',
							x === selectedPath &&
								'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-600/20 dark:text-blue-300'
						)}
						onClick={() => openFile(x)}
					>
						<TreeFileIcon path={x} />
						{x.split('/').slice(-1)}
						<div
							onClick={(e) => {
								e.stopPropagation()
								setOpenPaths((y) => y.filter((z) => z !== x))
								if (selectedPath === x) {
									const index = openPaths.indexOf(x)
									setSelectedPath(
										openPaths.length === 1
											? undefined
											: index - 1 >= 0
												? openPaths[index - 1]
												: openPaths[0]
									)
								}
							}}
							className={cn(
								'pointer-events-none opacity-0 group-hover:opacity-50 group-hover:pointer-events-auto group-hover:hover:opacity-100'
							)}
						>
							<XIcon className="w-4 h-4" />
						</div>
					</div>
				))}
			</div>
			{file &&
				(file.name.includes('.json') ? (
					<JsonFileRender key={file.path} {...props} />
				) : file.type === 'file' ? (
					<BasicFileRender key={file.path} {...props} />
				) : (
					<Welcome />
				))}
		</div>
	)
}

const BasicFileRender = ({ file, onContentChange }: FileRenderProps) => {
	const [dirty, setDirty] = useState(false)

	const [value, setValue] = useState(file.content)

	const hasChanges = !deepEqual(file.content, value)

	useEffect(() => {
		if (hasChanges && !dirty) setValue(file.content)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasChanges, dirty])

	const { theme } = useTheme()
	const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
	const monacoRef = useRef<Monaco | null>(null)

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor
		monacoRef.current = monaco

		monaco.editor.defineTheme('dark', {
			base: 'vs-dark',
			inherit: true,
			rules: [],
			colors: {
				'editor.background': '#020817',
				'editor.lineHighlightBackground': '#1e293b',
			},
		})

		// monaco.editor.defineTheme('light', {

		// })

		monaco.editor.setTheme(theme === 'dark' ? 'dark' : 'vs')

		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			experimentalDecorators: true,
			allowSyntheticDefaultImports: true,
			jsx: monaco.languages.typescript.JsxEmit.React,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			allowNonTsExtensions: true,
			target: monaco.languages.typescript.ScriptTarget.ES2020,
		})
	}

	const prevTheme = useRef<string | undefined>(theme)
	useEffect(() => {
		if (prevTheme.current !== theme) {
			monacoRef.current?.editor.setTheme(theme === 'dark' ? 'dark' : 'vs')
			prevTheme.current = theme
		}
	}, [theme])

	const ext = file.name.split('.').pop()

	return (
		<div className="flex flex-1 flex-col relative min-h-0">
			<div className="absolute top-0 right-0 mr-4 mt-4">
				<Button
					variant="outline"
					onClick={() => {
						onContentChange(value)
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

						onContentChange(value)
						setDirty(false)
					}
				}}
			>
				<Editor
					height="90vh"
					defaultLanguage={ext ? monacoLang[ext] || 'plaintext' : 'plaintext'}
					value={value}
					onChange={(val) => {
						setValue(val || '')
						setDirty(true)
					}}
					className="p-4"
					onMount={handleEditorDidMount}
				/>
			</div>
		</div>
	)
}

const JsonFileRender = ({ file, onContentChange }: FileRenderProps) => {
	const [value, setValue] = useState<Record<string, string>>(JSON.parse(file.content))

	useEffect(() => {
		if (!deepEqual(file.content, value)) setValue(JSON.parse(file.content))

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [file.content])

	return (
		<div className="flex flex-1 flex-col relative min-h-0 overflow-hidden">
			<div className="h-10 border-b shrink-0 flex items-center justify-center gap-2">
				<Button variant="pip-selected" size="pip">
					Settings
				</Button>

				<Button variant="pip" size="pip">
					Models
				</Button>
			</div>
			<div className="p-6 mt-10 flex-1 min-h-0 self-center overflow-auto flex flex-col gap-6 max-w-[600px] w-full">
				{Object.keys(value).map((key) => (
					<div key={key} className="flex flex-col gap-2">
						<label className="text-sm font-medium">{readable[key] || key}</label>
						<Input
							type="text"
							className="w-"
							value={
								typeof value[key] === 'string'
									? value[key]
									: typeof value[key] === 'object'
										? JSON.stringify(value[key])
										: ''
							}
							onChange={(e) => {
								setValue((x) => ({
									...x,
									[key]: e.target.value,
								}))
							}}
						/>
					</div>
				))}

				<div className="flex flex-row justify-end">
					<Button
						variant="default"
						onClick={() => {
							onContentChange(JSON.stringify(value, null, 4))
						}}
					>
						<SaveIcon className="w-4 h-4 mr-2" />
						Save
					</Button>
				</div>
			</div>
		</div>
	)
}
