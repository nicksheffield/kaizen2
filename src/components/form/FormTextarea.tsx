import { validate } from '@/components/form/utils'
import { Textarea, type TextareaProps } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useField } from 'formik'
import { type ReactNode, forwardRef, useRef } from 'react'
import { type ZodTypeAny } from 'zod'

type FormTextareaProps = Omit<TextareaProps, 'value' | 'onChange'> & {
	name: string
	validations?: ZodTypeAny
}

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
	({ name, validations, ...props }, ref) => {
		const [inputProps, { error, touched }, { setValue }] = useField({
			name,
			validate: validate(validations),
		})
		return (
			<>
				<Textarea
					value={String(inputProps.value)}
					onChange={(e) => setValue(e.currentTarget.value)}
					{...props}
					ref={ref}
				/>
				{error && touched && <div className="text-sm text-red-500">{error}</div>}
			</>
		)
	}
)

FormTextArea.displayName = 'FormInput'

type FormInputRowProps = FormTextareaProps & {
	label?: ReactNode
	description?: ReactNode
}

export const FormTextareaRow = ({ label, description, className, ...props }: FormInputRowProps) => {
	const ref = useRef<HTMLTextAreaElement>(null)

	return (
		<div className={cn('flex flex-col gap-1', className)}>
			{label && (
				<div className="text-sm font-medium" onClick={() => ref.current?.focus()}>
					{label}
				</div>
			)}
			{description && <div className="text-sm text-muted-foreground">{description}</div>}
			<FormTextArea {...props} ref={ref} autoComplete="off" />
		</div>
	)
}
