import { Hint } from '@/components/Hint'
import { validate } from '@/components/form/utils'
import { DatePicker, DatePickerProps } from '@/components/ui/datepicker'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useField } from 'formik'
import { useRef, type ReactNode, forwardRef } from 'react'
import { type ZodTypeAny } from 'zod'

type FormDateProps = DatePickerProps & {
	name: string | Array<string | number>
	validations?: ZodTypeAny
	className?: string
}

export const FormDate = forwardRef<HTMLButtonElement, FormDateProps>(
	({ name, validations, className, ...props }, ref) => {
		const [{ value }, { error, touched }, { setValue }] = useField({
			name: name instanceof Array ? name.join('.') : name,
			validate: validate(validations),
		})

		return (
			<>
				<DatePicker value={value} onValueChange={setValue} ref={ref} />
				{error && touched && <div className="text-sm text-red-500">{error}</div>}
			</>
		)
	}
)

FormDate.displayName = 'FormDate'

type FormDateRowProps = FormDateProps & {
	label?: ReactNode
	description?: ReactNode
	hint?: ReactNode
}

export const FormDateRow = ({ label, description, hint, className, ...props }: FormDateRowProps) => {
	const ref = useRef<HTMLButtonElement>(null)

	return (
		<label className={cn('flex flex-col gap-2', className)}>
			{(label || hint) && (
				<div className="flex items-center gap-2">
					{label && <Label onClick={() => ref.current?.focus()}>{label}</Label>}
					{hint && <Hint content={hint} />}
				</div>
			)}

			{description && <div className="text-sm text-muted-foreground">{description}</div>}
			<FormDate {...props} ref={ref} />
		</label>
	)
}

type DateRowProps = DatePickerProps & {
	label?: ReactNode
	description?: ReactNode
	hint?: ReactNode
	className?: string
}

export const DateRow = ({ label, description, hint, className, ...props }: DateRowProps) => {
	const ref = useRef<HTMLButtonElement>(null)

	return (
		<label className={cn('flex flex-col gap-2', className)}>
			{(label || hint) && (
				<div className="flex items-center gap-2">
					{label && <Label onClick={() => ref.current?.focus()}>{label}</Label>}
					{hint && <Hint content={hint} />}
				</div>
			)}

			{description && <div className="text-sm text-muted-foreground">{description}</div>}
			<DatePicker {...props} ref={ref} />
		</label>
	)
}
