import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useField } from 'formik'
import { type ReactNode, forwardRef, useId } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '@/lib/utils'
import { Hint } from '@/components/Hint'

type FormRadioItem = {
	value: string | boolean
	label: ReactNode
	description?: ReactNode
}

type FormRadioProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
	name: string
	items: FormRadioItem[]
}

export const FormRadioGroup = forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, FormRadioProps>(
	({ name, items, ...props }, ref) => {
		const [{ value }, {}, { setValue }] = useField({ name })

		return (
			<RadioGroup
				ref={ref}
				value={typeof value === 'boolean' ? String(value) : value}
				onValueChange={(val) => {
					if (typeof value === 'boolean') {
						setValue(val === 'true')
					} else {
						setValue(val)
					}
				}}
				{...props}
			>
				{items.map((item) => (
					<Item key={String(item.value)} value={item.value} label={item.label} />
				))}
			</RadioGroup>
		)
	}
)

const Item = ({ value, label }: FormRadioItem) => {
	const id = useId()

	return (
		<div className="flex flex-row items-start gap-2">
			<RadioGroupItem id={id} value={String(value)} className="mt-0.5" />

			<label htmlFor={id} className="flex flex-col gap-1">
				<div className="text-sm">{label}</div>
			</label>
		</div>
	)
}

FormRadioGroup.displayName = 'FormRadioGroup'

type FormRadioGroupRowProps = FormRadioProps & {
	label: ReactNode
	description?: ReactNode
}

export const FormRadioGroupRow = ({ label, description, className, ...props }: FormRadioGroupRowProps) => {
	const haveDesc = props.items.some((item) => item.description)

	return (
		<div className={cn('flex flex-col gap-3', className)}>
			<div className="flex items-center gap-2 text-sm font-medium">
				{label}
				{haveDesc && (
					<Hint
						content={
							<div className="flex flex-col gap-2">
								{props.items
									.filter((x) => x.description)
									.map((item, i) => (
										<div key={i} className="flex flex-col gap-1">
											<div className="font-bold">{item.label}</div>
											<div>{item.description}</div>
										</div>
									))}
							</div>
						}
					/>
				)}
			</div>
			{description && <div className="text-sm text-muted-foreground">{description}</div>}
			<FormRadioGroup {...props} />
		</div>
	)
}
