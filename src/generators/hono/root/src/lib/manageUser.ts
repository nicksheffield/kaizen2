import { mapAttributeTypeToJs } from '@/generators/hono/utils'
import { ProjectCtx } from '@/generators/types'
import { isNotNone } from '@/lib/utils'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const user = project.models.find((x) => project.project.userModelId === x.id)

	return `import { db } from '@/lib/db.js'
	import { emailVerificationCodes, users } from '@/schema.js'
	import { generateId } from 'lucia'
	import { TimeSpan, createDate } from 'oslo'
	import { generateRandomString, alphabet } from 'oslo/crypto'
	import { eq } from 'drizzle-orm'
	import { sendVerificationEmail } from '@/lib/email.js'
	import { HTTPException } from 'hono/http-exception'
	import { hashPassword, validatePassword } from '@/lib/password.js'
	
	const generateEmailVerificationCode = async (
		userId: string,
		email: string
	): Promise<string> => {
		await db
			.delete(emailVerificationCodes)
			.where(eq(emailVerificationCodes.userId, userId))
	
		const code = generateRandomString(8, alphabet('0-9'))
		await db.insert(emailVerificationCodes).values({
			id: generateId(15),
			userId,
			email,
			code,
			expiresAt: createDate(new TimeSpan(15, 'm')), // 15 minutes
		})
	
		return code
	}

	type UserFields = {
		${user?.attributes
			.map((x) => {
				if (!x.insertable) return null
				if (x.name === 'password') return null
				if (x.name === 'email') return null

				return `${x.name}: ${mapAttributeTypeToJs(x.type)} ${x.nullable || x.name === 'id' ? '| null | undefined' : ''}`
			})
			.filter(isNotNone)
			.join('; ')}
	}
	
	export const createUser = async (email: string, password: string, fields: UserFields) => {
		const userId = fields.id || generateId(15)
	
		const newUser = {
			id: userId,
			email,
		}
	
		await validatePassword(password)
	
		const existingUser = await db
			.select()
			.from(users)
			.where(
				or(
					eq(users.email, newUser.email),
					eq(users.id, newUser.id)
				)
			)
	
		if (existingUser.length) {
			throw new HTTPException(400, {
				message: 'Email already in use',
			})
		}
	
		const hashedPassword = await hashPassword(password)
	
		await db.insert(users).values({ ...newUser, password: hashedPassword })
	
		const verificationCode = await generateEmailVerificationCode(userId, email)
	
		sendVerificationEmail(email, userId, verificationCode)
	
		return db.query.users.findFirst({
			where: eq(users.id, userId),
		})
	}
	
	export const updateUser = async (
		userId: string,
		email: string | undefined,
		password: string | undefined,
		fields: Omit<UserFields, 'id'>
	) => {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		})
	
		if (!user) {
			throw new HTTPException(404, {
				message: 'User not found',
			})
		}
	
		let hashedPassword: string | undefined = undefined
	
		if (password) {
			await validatePassword(password)
			hashedPassword = await hashPassword(password)
		}
	
		await db
			.update(users)
			.set({
				email,
				password: hashedPassword,
				...fields
			})
			.where(eq(users.id, userId))
	
		return db.query.users.findFirst({
			where: eq(users.id, userId),
		})
	}
	`
}

export default tmpl
