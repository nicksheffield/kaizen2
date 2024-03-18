import { Form, FormInputRow, FormInputRowProps, useForm } from '@/components/form'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const ProjectSettings = () => {
	const { project, saveProject } = useApp()

	const form = useForm({
		initialValues: {
			project: project?.project,
			formatSettings: project?.formatSettings,
			env: project?.env,
		},
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

	const [accordion, setAccordion] = useState(['project'])

	return (
		<Form context={form} className="flex-1 flex flex-col min-h-0">
			<ScrollArea className="flex-1">
				<Accordion type="multiple" value={accordion} onValueChange={setAccordion}>
					<AccordionItem value="project">
						<AccordionTrigger className="px-4">Project</AccordionTrigger>
						<AccordionContent>
							<div className="flex flex-col gap-6 p-4 max-w-[600px] w-full mx-auto">
								<FormInputRow name="project.name" label="Name" description="The name of the project." />
								<FormInputRow
									name="project.domainName"
									label="Domain Name"
									description="The domain name where the project is hosted."
								/>
								<FormInputRow
									name="project.maxBodySize"
									label="Max Body Size"
									description="Max upload size limit."
								/>
								<FormInputRow
									name="project.connectionTimeout"
									label="Connection Timeout"
									description="How long to allow connecting to the database before giving up."
								/>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="format">
						<AccordionTrigger className="px-4">Formatting</AccordionTrigger>
						<AccordionContent>
							<div className="flex flex-col gap-6 p-4 max-w-[600px] w-full mx-auto">
								<FormInputRow
									name="formatSettings.prettierTabs"
									label="Tabs"
									description="Indent lines with tabs instead of spaces."
								/>
								<FormInputRow
									name="formatSettings.prettierTabWidth"
									label="Tab Width"
									description="Specify the number of spaces per indentation-level."
								/>
								<FormInputRow
									name="formatSettings.prettierSemicolons"
									label="Semicolons"
									description="Print semicolons at the ends of statements."
								/>
								<FormInputRow
									name="formatSettings.prettierPrintWidth"
									label="Print Width"
									description="Specify the line length that the printer will wrap on."
								/>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="env">
						<AccordionTrigger className="px-4">Environment</AccordionTrigger>
						<AccordionContent>
							<div className="flex flex-col gap-6 p-4 max-w-[600px] w-full mx-auto">
								<TogglePasswordInputRow
									name="env.ACCESS_TOKEN_SECRET"
									label="ACCESS_TOKEN_SECRET"
									description="A secret string used to encode and decode JWT access tokens."
								/>

								<TogglePasswordInputRow
									name="env.REFRESH_TOKEN_SECRET"
									label="REFRESH_TOKEN_SECRET"
									description="A secret string used to encode and decode JWT refresh tokens."
								/>

								<TogglePasswordInputRow
									name="env.MARIADB_ROOT_PASSWORD"
									label="MARIADB_ROOT_PASSWORD"
									description="The password of the db's root account."
								/>
								<TogglePasswordInputRow
									name="env.MYSQL_USER"
									label="MYSQL_USER"
									description="The name of the main db user."
								/>
								<TogglePasswordInputRow
									name="env.MYSQL_PASSWORD"
									label="MYSQL_PASSWORD"
									description="The password of the main db user."
								/>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</ScrollArea>
			<div className="flex justify-end bg-muted/50 border-t -mt-px p-4">
				<Button type="submit">Save</Button>
			</div>
		</Form>
	)
}

const TogglePasswordInputRow = (props: FormInputRowProps) => {
	const [show, setShow] = useState(false)

	return (
		<div className="relative">
			<FormInputRow {...props} type={show ? 'text' : 'password'} inputClassName="pr-10" />
			<div className="absolute bottom-0 right-0 mb-2 flex flex-col items-center pr-3">
				{show ? (
					<EyeOffIcon
						className="w-4 cursor-pointer hover:opacity-80"
						onClick={() => setShow((prev) => !prev)}
					/>
				) : (
					<EyeIcon className="w-4 cursor-pointer hover:opacity-80" onClick={() => setShow((prev) => !prev)} />
				)}
			</div>
		</div>
	)
}
