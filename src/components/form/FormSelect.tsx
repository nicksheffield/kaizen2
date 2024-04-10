import { Hint } from '@/components/Hint'
import { validate } from '@/components/form/utils'
import { buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { type SelectProps } from '@radix-ui/react-select'
import { useField } from 'formik'
import { XIcon } from 'lucide-react'
import { useRef, type ReactNode, forwardRef } from 'react'
import { type ZodTypeAny } from 'zod'

type Option = {
	label: string
	value: unknown
	disabled?: boolean
}

type FormSelectProps = Omit<SelectProps, 'name' | 'value' | 'onChange'> & {
	name: string | Array<string | number>
	options: Option[]
	validations?: ZodTypeAny
	placeholder?: string
	clearable?: boolean
	className?: string
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
	({ name, options, placeholder, clearable, validations, className, ...props }, ref) => {
		const [inputProps, { error, touched }, { setValue }] = useField({
			name: name instanceof Array ? name.join('.') : name,
			validate: validate(validations),
		})

		return (
			<>
				<Select value={String(inputProps.value)} onValueChange={(value) => setValue(value)} {...props}>
					<SelectTrigger className={cn('relative [&>span]:truncate', className)} ref={ref}>
						<SelectValue placeholder={placeholder} />
						{/* <SelectValue placeholder={placeholder} asChild>
							<span className="pointer-events-none truncate">
								{options?.find((x) => x.value === String(inputProps.value))?.label || ''}
							</span>
						</SelectValue> */}
						{clearable && inputProps.value && (
							<div className="absolute right-0 top-0 z-10 mr-8 flex h-full items-center">
								<div
									onClick={(e) => {
										e.stopPropagation()
										e.preventDefault()
										props.onValueChange?.('')
									}}
									onPointerDown={(e) => {
										e.stopPropagation()
										e.preventDefault()
									}}
									className={buttonVariants({ size: 'tiny', variant: 'ghost' })}
								>
									<XIcon className="h-4 w-4" />
								</div>
							</div>
						)}
					</SelectTrigger>
					<SelectContent position="item-aligned">
						{options.map((option, i) => (
							<SelectItem
								key={i}
								value={String(option.value)}
								disabled={option.disabled}
								className={cn(option.disabled && 'opacity-50')}
							>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{error && touched && <div className="text-sm text-red-500">{error}</div>}
			</>
		)
	}
)

FormSelect.displayName = 'FormSelect'

type FormSelectRowProps = FormSelectProps & {
	label?: ReactNode
	description?: ReactNode
	hint?: ReactNode
}

export const FormSelectRow = ({ label, description, hint, className, ...props }: FormSelectRowProps) => {
	const ref = useRef<HTMLButtonElement>(null)

	return (
		<div className={cn('flex flex-col gap-3', className)}>
			{(label || description) && (
				<div className="flex flex-col gap-1">
					{(label || hint) && (
						<div className="flex items-center gap-2">
							{label && <Label onClick={() => ref.current?.focus()}>{label}</Label>}
							{hint && <Hint content={hint} />}
						</div>
					)}

					{description && <div className="text-sm text-muted-foreground">{description}</div>}
				</div>
			)}

			<FormSelect {...props} ref={ref} />
		</div>
	)
}

type SelectRowProps = SelectProps & {
	label?: ReactNode
	description?: ReactNode
	placeholder?: string
	hint?: ReactNode
	clearable?: boolean
	options: Option[]
	className?: string
}

export const SelectRow = ({
	label,
	description,
	placeholder,
	hint,
	clearable,
	options,
	className,
	...props
}: SelectRowProps) => {
	const ref = useRef<HTMLButtonElement>(null)

	return (
		<div className={cn('flex flex-col gap-3', className)}>
			{(label || description) && (
				<div className="flex flex-col gap-1">
					{(label || hint) && (
						<div className="flex items-center gap-2">
							{label && <Label onClick={() => ref.current?.focus()}>{label}</Label>}
							{hint && <Hint content={hint} />}
						</div>
					)}

					{description && <div className="text-sm text-muted-foreground">{description}</div>}
				</div>
			)}

			<Select {...props}>
				<SelectTrigger className={cn('relative', className)} ref={ref}>
					<SelectValue placeholder={placeholder} />
					{/* <SelectValue placeholder={placeholder} asChild>
						<span className="pointer-events-none truncate">
							{options?.find((x) => x.value === String(props.value))?.label || ''}
						</span>
					</SelectValue> */}
					{clearable && props.value && (
						<div className="absolute right-0 top-0 z-10 mr-8 flex h-full items-center">
							<div
								onClick={(e) => {
									e.stopPropagation()
									e.preventDefault()
									props.onValueChange?.('')
								}}
								onPointerDown={(e) => {
									e.stopPropagation()
									e.preventDefault()
								}}
								className={buttonVariants({ size: 'tiny', variant: 'ghost' })}
							>
								<XIcon className="h-4 w-4" />
							</div>
						</div>
					)}
				</SelectTrigger>
				<SelectContent position="item-aligned">
					{options.map((option, i) => (
						<SelectItem
							key={i}
							value={String(option.value)}
							disabled={option.disabled}
							className={cn(option.disabled && 'opacity-50')}
						>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
