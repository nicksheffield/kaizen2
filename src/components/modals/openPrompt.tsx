import { ModalCloseFn, openModal } from '@/components/Modal'
import { DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormInputRow, useForm } from '@/components/form'

type OpenPromptProps = {
	label: string
	onSubmit: (val: string) => Promise<void>
}

export const openPrompt = (props: OpenPromptProps) => {
	return openModal({
		render: (close) => <Congratulate {...props} close={close} />,
	})
}

const Congratulate = ({ label, onSubmit, close }: OpenPromptProps & { close: ModalCloseFn }) => {
	const form = useForm<{ prompt: string }>({
		initialValues: {
			prompt: '',
		},
		onSubmit: async (val) => {
			await onSubmit(val.prompt)
			close()
		},
	})
	return (
		<DialogContent>
			<Form context={form}>
				<div className="flex flex-row gap-2 items-end">
					<FormInputRow label={label} name="prompt" className="flex-1" />

					<Button type="submit" variant="default">
						Ok
					</Button>
				</div>
			</Form>
		</DialogContent>
	)
}
