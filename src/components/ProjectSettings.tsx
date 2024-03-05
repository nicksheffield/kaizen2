import { Form, FormInputRow, useForm } from '@/components/form'
import { useApp } from '@/lib/AppContext'

export const ProjectSettings = () => {
	const { project } = useApp()

	const form = useForm({
		initialValues: project?.project || {},
		onSubmit: (values) => {
			console.log('submit', values)
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
			</div>
		</Form>
	)
}
