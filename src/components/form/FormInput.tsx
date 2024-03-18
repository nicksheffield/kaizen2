import { validate } from '@/components/form/utils'
import { Input, type InputProps } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useField } from 'formik'
import { type ReactNode, forwardRef, useRef } from 'react'
import { type ZodTypeAny } from 'zod'

type FormInputProps = Omit<InputProps, 'name' | 'value' | 'onChange'> & {
	name: string | Array<string | number>
	validations?: ZodTypeAny
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ name, validations, ...props }, ref) => {
	const [inputProps, { error, touched }, { setValue }] = useField({
		name: name instanceof Array ? name.join('.') : name,
		validate: validate(validations),
	})
	return (
		<>
			<Input
				value={inputProps.value !== undefined && inputProps.value !== null ? String(inputProps.value) : ''}
				onChange={(e) => setValue(e.currentTarget.value)}
				{...props}
				ref={ref}
			/>
			{error && touched && <div className="text-sm text-red-500">{error}</div>}
		</>
	)
})

FormInput.displayName = 'FormInput'

export type FormInputRowProps = FormInputProps & {
	label?: ReactNode
	description?: ReactNode
	inputClassName?: string
}

export const FormInputRow = ({ label, description, className, inputClassName, ...props }: FormInputRowProps) => {
	const ref = useRef<HTMLInputElement>(null)

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{label && (
				<div className="flex items-center gap-2">
					{label && <Label onClick={() => ref.current?.focus()}>{label}</Label>}
				</div>
			)}

			{description && <div className="text-sm text-muted-foreground">{description}</div>}

			<FormInput {...props} className={inputClassName} ref={ref} autoComplete="off" />
		</div>
	)
}

type InputRowProps = InputProps & {
	label?: ReactNode
	description?: ReactNode
	className?: string
}

export const InputRow = ({ label, description, className, ...props }: InputRowProps) => {
	const ref = useRef<HTMLInputElement>(null)

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{label && (
				<div className="flex items-center gap-2">
					{label && <Label onClick={() => ref.current?.focus()}>{label}</Label>}
				</div>
			)}

			{description && <div className="text-sm text-muted-foreground">{description}</div>}

			<Input {...props} ref={ref} autoComplete="off" />
		</div>
	)
}
