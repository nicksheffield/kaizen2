const tmpl = () => {
	return `import { db } from '@/lib/db.js'
import { eq, lt } from 'drizzle-orm'
import * as tables from '@/schema.js'
import { generateId } from 'lucia'
import { Argon2id } from 'oslo/password'
import { migrate } from 'drizzle-orm/mysql2/migrator'

export const seed = async () => {
	// update database schema
	await migrate(db, { migrationsFolder: './migrations' })

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
		})
	}
}
`
}

export default tmpl
