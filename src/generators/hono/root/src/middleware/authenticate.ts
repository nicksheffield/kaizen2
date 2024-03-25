const tmpl = () => `import { lucia } from '@/lib/lucia.js'
import { Context, MiddlewareHandler } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { Session, User } from 'lucia'

export const getSession = async (c: Context) => {
	const cookie = getCookie(c)

	if (cookie) {
		const sessionCookie = cookie.auth_session
		if (sessionCookie) {
			const res = await lucia.validateSession(sessionCookie)
			return res
		}
	}

	const authorization = c.req.header('authorization')

	if (authorization) {
		const token = lucia.readBearerToken(authorization)
		if (token) {
			const res = await lucia.validateSession(token)
			return res
		}
	}

	return { user: null, session: null }
}

export const authenticate: MiddlewareHandler<{
	Variables: {
		user: User
		session: Session
	}
}> = async (c, next) => {
	const { user, session } = await getSession(c)

	// if no session, return 401
	if (!user || !session) {
		throw new HTTPException(401, { message: 'Unauthorized' })
	}

	// handle refreshing session
	if (session.fresh) {
		await setSessionCookies(c, user)
	}

	c.set('user', user)
	c.set('session', session)

	await next()
}

export const setSessionCookies = async (c: Context, user: { id: string }) => {
	const session = await lucia.createSession(user.id, {})

	const newCookie = lucia.createSessionCookie(session.id)

	setCookie(c, 'auth_session', session.id, {
		secure: newCookie.attributes.secure,
		path: newCookie.attributes.path,
		domain: newCookie.attributes.domain,
		sameSite: newCookie.attributes.sameSite?.toLowerCase() as any,
		httpOnly: newCookie.attributes.httpOnly,
		maxAge: newCookie.attributes.maxAge,
		expires: newCookie.attributes.expires,
	})

	setCookie(c, 'auth_exists', 'true', {
		secure: false,
		path: newCookie.attributes.path,
		domain: newCookie.attributes.domain,
		sameSite: newCookie.attributes.sameSite?.toLowerCase() as any,
		httpOnly: false,
		maxAge: newCookie.attributes.maxAge,
		expires: newCookie.attributes.expires,
	})

	return session
}

export const doLogin = async (c: Context, user: { id: string }) => {
	const session = await setSessionCookies(c, user)

	return c.json({ token: session.id })
}
`

export default tmpl
