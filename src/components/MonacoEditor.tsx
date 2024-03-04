import { useEffect, useRef } from 'react'
import { useTheme } from '../lib/ThemeContext'
import { Editor, Monaco, OnMount } from '@monaco-editor/react'

const monacoLang: Record<string, string> = {
	json: 'json',
	js: 'javascript',
	ts: 'typescript',
	html: 'html',
	css: 'css',
	scss: 'scss',
	md: 'markdown',
	txt: 'plaintext',
}

type MonacoEditorProps = {
	value: string
	onValueChange: (val: string) => void
	extension?: string
}

export const MonacoEditor = ({
	value,
	onValueChange,
	extension,
}: MonacoEditorProps) => {
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
			moduleResolution:
				monaco.languages.typescript.ModuleResolutionKind.NodeJs,
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

	return (
		<Editor
			height="90vh"
			defaultLanguage={
				extension ? monacoLang[extension] || 'plaintext' : 'plaintext'
			}
			value={value}
			onChange={(val) => {
				onValueChange(val || '')
			}}
			className="p-4"
			onMount={handleEditorDidMount}
		/>
	)
}
