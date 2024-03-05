import { Hint } from '@/components/Hint'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useField } from 'formik'
import { type ReactNode } from 'react'
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox'

type FormCheckboxProps = {
	name: string | Array<string | number>
}

export const FormCheckbox = ({ name, ...props }: FormCheckboxProps) => {
	const [inputProps, { error, touched }, { setValue }] = useField({
		name: name instanceof Array ? name.join('.') : name,
	})
	return (
		<>
			<Checkbox
				checked={
					inputProps.value !== undefined && inputProps.value !== null
						? String(inputProps.value) === 'true'
						: false
				}
				onCheckedChange={(val) => setValue(val)}
				{...props}
			/>
			{error && touched && <div className="text-sm text-red-500">{error}</div>}
		</>
	)
}

FormCheckbox.displayName = 'FormCheckbox'

type FormCheckboxRowProps = FormCheckboxProps & {
	label: ReactNode
	description?: ReactNode
	hint?: ReactNode
	className?: string
}

export const FormCheckboxRow = ({ label, description, hint, className, ...props }: FormCheckboxRowProps) => {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<div className="flex items-center gap-2">
				<Label>
					<div className="flex gap-2">
						<div className="flex items-center gap-3">
							<FormCheckbox {...props} />
							{label}
						</div>
						{hint && <Hint content={hint} />}
					</div>
				</Label>
			</div>

			{description && <div className="text-sm text-muted-foreground">{description}</div>}
		</div>
	)
}

type CheckboxRowProps = CheckboxProps & {
	label: ReactNode
	description?: ReactNode
	hint?: ReactNode
	className?: string
}

export const CheckboxRow = ({ label, description, hint, className, ...props }: CheckboxRowProps) => {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<div className="flex items-center gap-2">
				<Label>
					<div className="flex gap-2">
						<div className="flex items-center gap-3">
							<Checkbox {...props} />
							{label}
						</div>
						{hint && <Hint content={hint} />}
					</div>
				</Label>
			</div>

			{description && <div className="text-sm text-muted-foreground">{description}</div>}
		</div>
	)
}
