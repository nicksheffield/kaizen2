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
	const { selectedFile, saveFile } = useApp()

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
		<div className="flex flex-1 flex-col relative min-h-0 overflow-hidden">
			<div className="h-10 border-b shrink-0 flex items-center justify-center gap-2">
				<PipTabs value={tab} onValueChange={(val) => setTab(val)} items={{ form: 'Form', code: 'Code' }} />
			</div>

			{tab === 'form' ? (
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
								saveFile(selectedFile.path, JSON.stringify(value, null, 4))
							}}
						>
							<SaveIcon className="w-4 h-4 mr-2" />
							Save
						</Button>
					</div>
				</div>
			) : (
				<div
					className="flex-1 min-h-0 overflow-auto flex flex-col"
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
