import { ModalCloseFn, openModal } from '@/components/Modal'
import { DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormInputRow, useForm } from '@/components/form'
import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

type OpenPromptProps = {
	label: string
	onSubmit: (val: string) => Promise<void> | void
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

					<Button type="submit" variant="default" disabled={form.isSubmitting} className="relative">
						<div
							className={cn(
								'absolute inset-0 flex items-center justify-center',
								!form.isSubmitting && 'opacity-0'
							)}
						>
							<Loader2Icon className="w-4 animate-spin" />
						</div>

						<div className={cn(form.isSubmitting && 'opacity-0')}>Ok</div>
					</Button>
				</div>
			</Form>
		</DialogContent>
	)
}
