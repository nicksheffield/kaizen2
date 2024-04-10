import { useEffect, useState } from 'react'
import { useApp } from '../../lib/AppContext'
import deepEqual from 'deep-equal'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { SaveIcon } from 'lucide-react'
import { MonacoEditor } from '../MonacoEditor'
import { PipTabs } from '../PipTabs'
import { safeParse } from '@/lib/utils'

const readable: Record<string, string> = {
	name: 'Name',
	repoUrl: 'Repo Url',
	domainName: 'Domain Name',
	maxBodySize: 'Max Body Size',
	connectionTimeout: 'Connection Timeout',
}

export const JSONEditor = () => {
	const selectedFile = useApp((v) => v.selectedFile)
	const saveFile = useApp((v) => v.saveFile)

	const [value, setValue] = useState<Record<string, string>>(safeParse(selectedFile?.content || '', {}))

	useEffect(() => {
		if (!selectedFile) return
		if (!deepEqual(selectedFile.content, value)) {
			setValue(safeParse(selectedFile.content, {}))
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFile])

	const [tab, setTab] = useState<'form' | 'code'>('form')

	if (!selectedFile) return null

	return (
		<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
			<div className="flex h-10 shrink-0 items-center justify-center gap-2 border-b">
				<PipTabs value={tab} onValueChange={(val) => setTab(val)} items={{ form: 'Form', code: 'Code' }} />
			</div>

			{tab === 'form' ? (
				<div className="mt-10 flex min-h-0 w-full max-w-[600px] flex-1 flex-col gap-6 self-center overflow-auto p-6">
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
								saveFile(selectedFile.path, JSON.stringify(value, null, 4))
							}}
						>
							<SaveIcon className="mr-2 h-4 w-4" />
							Save
						</Button>
					</div>
				</div>
			) : (
				<div
					className="flex min-h-0 flex-1 flex-col overflow-auto"
					onKeyDown={(e) => {
						if (e.key === 's' && e.metaKey) {
							e.stopPropagation()
							e.preventDefault()

							saveFile(selectedFile.path, JSON.stringify(value, null, 4))
						}
					}}
				>
					<MonacoEditor
						value={JSON.stringify(value, null, 4)}
						onValueChange={(val) => setValue(JSON.parse(val))}
						extension="json"
					/>
				</div>
			)}
		</div>
	)
}
