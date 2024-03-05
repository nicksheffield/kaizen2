import { type ZodTypeAny } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const validate = (validations?: ZodTypeAny) => (value: unknown) => {
	if (!validations) return undefined

	const result = validations.safeParse(value)

	if (result.success) return undefined

	return fromZodError(result.error).details[0]?.message
}
