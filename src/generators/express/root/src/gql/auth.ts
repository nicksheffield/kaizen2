const tmpl = () => `import { Request } from 'express'
import { AuthChecker } from 'type-graphql'
import { AuthUser } from '~/utils/auth'

type CreateAuthChecker = () => { check: AuthChecker<{ req: Request; user: AuthUser }> }

export const customAuthChecker: CreateAuthChecker = () => ({
	check: ({ context }, roles) => {
		return !!context.user
	},
})
`

export default tmpl
