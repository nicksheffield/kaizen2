const tmpl = () => `import { db } from '@/lib/db.js'
import { users } from '@/schema.js'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { authenticate } from '@/middleware/authenticate.js'

export const router = new Hono()

router.get('/profile', authenticate, async (c) => {
	const user = c.get('user')

	const dbUser = await db.query.users.findFirst({
		columns: {
			password: false,
			twoFactorSecret: false,
			emailVerified: false,
		},
		where: eq(users.id, user.id),
	})

	return c.json(dbUser)
})
`

export default tmpl
