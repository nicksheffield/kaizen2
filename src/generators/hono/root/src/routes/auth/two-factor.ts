import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	return `import { db } from '@/lib/db.js'
import { recoveryCodes, users } from '@/schema.js'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { encodeHex, decodeHex } from 'oslo/encoding'
import { TOTPController, createTOTPKeyURI } from 'oslo/otp'
import { authenticate } from '@/middleware/authenticate.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import crypto from 'crypto'
import { Argon2id } from 'oslo/password'

const appName = '${project.project.name}'

const verify2faSchema = z.object({
	otp: z.string(),
})

export const router = new Hono()

router.post('/setup-twofactor', authenticate, async (c) => {
	const user = c.get('user')

	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, user.id),
	})

	if (dbUser?.twoFactorEnabled) {
		return c.body(null, 204)
	}

	const twoFactorSecret = crypto.getRandomValues(new Uint8Array(20))
	await db
		.update(users)
		.set({
			twoFactorSecret: encodeHex(twoFactorSecret),
			twoFactorEnabled: false,
		})
		.where(eq(users.id, user.id))

	// pass the website's name and the user identifier (e.g. email, username)
	const uri = createTOTPKeyURI(appName, user.email, twoFactorSecret)

	return c.json({ uri })
})

router.post(
	'/confirm-twofactor',
	authenticate,
	zValidator('json', verify2faSchema),
	async (c) => {
		const user = c.get('user')

		const dbUser = await db.query.users.findFirst({
			where: eq(users.id, user.id),
		})

		if (!dbUser || dbUser.twoFactorEnabled || !dbUser.twoFactorSecret) {
			return c.body(null, 204)
		}

		const body: z.infer<typeof verify2faSchema> = await c.req.json()
		const validOTP = await new TOTPController().verify(
			body.otp,
			decodeHex(dbUser.twoFactorSecret)
		)

		if (!validOTP) {
			return c.json({ message: 'Invalid Authentication Code' }, 400)
		}

		const numberOfRecoveryCodes = 3
		const codes = new Array(numberOfRecoveryCodes)
			.fill(null)
			.map((x) => crypto.randomBytes(20).toString('hex'))
		console.log('codes', codes)

		let codeHashes: string[] = []

		for (let i = 0; i < codes.length; i++) {
			const codeHash = await new Argon2id().hash(codes[i])
			codeHashes.push(codeHash)
		}

		await db
			.insert(recoveryCodes)
			.values(codeHashes.map((x) => ({ codeHash: x, userId: user.id })))

		await db
			.update(users)
			.set({
				twoFactorEnabled: true,
			})
			.where(eq(users.id, user.id))

		return c.json({ recoveryCodes: codes })
	}
)

router.post('/disable-twofactor', authenticate, async (c) => {
	const user = c.get('user')

	await db
		.update(users)
		.set({ twoFactorSecret: null, twoFactorEnabled: false })
		.where(eq(users.id, user.id))

	await db.delete(recoveryCodes).where(eq(recoveryCodes.userId, user.id))

	return c.body(null, 204)
})
`
}

export default tmpl
