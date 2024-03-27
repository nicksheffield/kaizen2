import { ModelCtx } from '@/generators/hono/contexts'
import { ProjectCtx } from '@/generators/types'
import { isNotNone } from '@/lib/utils'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const userModel = models.find((x) => project.project.userModelId === x.id)

	return `import { db } from '@/lib/db.js'
import { eq, lt } from 'drizzle-orm'
import * as tables from '@/schema.js'
import { generateId } from 'lucia'
import { Argon2id } from 'oslo/password'
import { migrate } from '@/migrate.js'

export const seed = async () => {
	// update database schema
	await migrate()

	// wipe out all the old sessions
	await db
		.delete(tables.sessions)
		.where(lt(tables.sessions.expiresAt, new Date()))

	// wipe out all the old email verifications
	await db
		.delete(tables.emailVerificationCodes)
		.where(lt(tables.emailVerificationCodes.expiresAt, new Date()))

	// wipe out all the old password resets
	await db
		.delete(tables.passwordResetToken)
		.where(lt(tables.passwordResetToken.expiresAt, new Date()))

	// create admin user if it doesn't exist
	const adminUser = await db.query.users.findFirst({
		where: eq(tables.users.email, 'admin@example.com'),
	})

	if (!adminUser) {
		await db.insert(tables.users).values({
			id: generateId(15),
			email: 'admin@example.com',
			password: await new Argon2id().hash('password'),
			roles: 'default|admin',
			${userModel?.attributes
				.map((x) => {
					if (!x.insertable) return null
					if (x.name === 'id') return null
					if (x.name === 'email') return null
					if (x.name === 'password') return null
					if (x.name === 'roles') return null

					if (x.type === 'varchar' || x.type === 'text') {
						return `${x.name}: ''`
					}
				})
				.filter(isNotNone)
				.join(',')}
		})
	}
}
`
}

export default tmpl
