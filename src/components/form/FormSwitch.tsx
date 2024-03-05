import { Hint } from '@/components/Hint'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useField } from 'formik'
import { type ReactNode } from 'react'
import { Switch, SwitchProps } from '@/components/ui/switch'

type FormSwitchProps = {
	name: string | Array<string | number>
}

export const FormSwitch = ({ name, ...props }: FormSwitchProps) => {
	const [inputProps, { error, touched }, { setValue }] = useField({
		name: name instanceof Array ? name.join('.') : name,
	})
	return (
		<>
			<Switch
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

FormSwitch.displayName = 'FormSwitch'

type FormSwitchRowProps = FormSwitchProps & {
	label: ReactNode
	description?: ReactNode
	hint?: ReactNode
	className?: string
}

export const FormSwitchRow = ({ label, description, hint, className, ...props }: FormSwitchRowProps) => {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<div className="flex items-center gap-2">
				<Label>
					<div className="flex gap-2">
						<div className="flex items-center gap-3">
							<FormSwitch {...props} />
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

type SwitchRowProps = SwitchProps & {
	label: ReactNode
	description?: ReactNode
	hint?: ReactNode
	className?: string
}

export const SwitchRow = ({ label, description, hint, className, ...props }: SwitchRowProps) => {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<div className="flex items-center gap-2">
				<Label>
					<div className="flex gap-2">
						<div className="flex items-center gap-3">
							<Switch {...props} />
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
