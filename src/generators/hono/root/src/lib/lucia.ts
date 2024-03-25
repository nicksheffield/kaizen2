const tmpl = () => `import { Lucia, TimeSpan } from 'lucia'
import { adapter } from './db.js'
import { env } from '@/lib/env.js'

export const sessionExpiresIn = new TimeSpan(1, 'h')

export const lucia = new Lucia(adapter, {
	sessionExpiresIn,
	sessionCookie: {
		attributes: {
			// set to \`true\` when using HTTPS
			secure: env.NODE_ENV === 'production',
		},
	},
	getUserAttributes: (attributes) => {
		return {
			id: attributes.id,
			email: attributes.email,
			emailVerified: attributes.emailVerified,
			setupTwoFactor:
				attributes.twoFactorSecret !== null &&
				attributes.twoFactorEnabled, // what is it even used for??
		}
	},
})

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia
		DatabaseUserAttributes: {
			id: string
			email: string
			emailVerified: boolean
			twoFactorSecret: string | null
			twoFactorEnabled: boolean
		}
	}
}
`

export default tmpl
