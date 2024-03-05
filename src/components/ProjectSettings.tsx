import { Form, FormInputRow, useForm } from '@/components/form'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/AppContext'
import { ProjectSettings as ProjectSettingsType } from '@/lib/schemas'
import { toast } from 'sonner'

export const ProjectSettings = () => {
	const { project, saveProject } = useApp()

	const form = useForm<ProjectSettingsType | {}>({
		initialValues: project?.project || {},
		onSubmit: async (values) => {
			if (!project) return

			const newProj = {
				...project,
				project: {
					...project?.project,
					...values,
				},
			}

			await saveProject(newProj)

			toast('Project settings saved', { closeButton: true })
		},
	})

	return (
		<Form context={form}>
			<div className="flex flex-col gap-6 p-4">
				<FormInputRow label="Name:" name="name" />
				<FormInputRow label="Repo Url" name="repoUrl" />
				<FormInputRow label="Domain Name" name="domainName" />
				<FormInputRow label="Max Body Size" name="maxBodySize" />
				<FormInputRow label="Connection Timeout" name="connectionTimeout" />
				<div className="flex justify-end">
					<Button type="submit">Save</Button>
				</div>
			</div>
		</Form>
	)
}
