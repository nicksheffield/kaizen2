const tmpl = () => `import { lucia } from '@/lib/lucia.js'
import { Hono } from 'hono'
import { getSession } from '@/middleware/authenticate.js'
import { setCookie } from 'hono/cookie'

export const router = new Hono()

router.post('/logout', async (c) => {
	const { session } = await getSession(c)
	if (session) {
		await lucia.invalidateSession(session.id)
	}

	setCookie(c, 'auth_exists', 'false', {
		maxAge: 0,
		expires: new Date(0),
	})

	return c.body(null, 204)
})
`

export default tmpl
