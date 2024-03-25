const tmpl = () => `import { db } from '@/lib/db.js'
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

export const createUser = async (email: string, password: string) => {
	const userId = generateId(15)

	const newUser = {
		id: userId,
		email: email,
	}

	await validatePassword(password)

	const existingUser = await db
		.select()
		.from(users)
		.where(eq(users.email, email))

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
	password: string | undefined
) => {
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	})

	if (!user) {
		throw new HTTPException(404, {
			message: 'User not found',
		})
	}

	const newUser = {
		email: email,
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
		})
		.where(eq(users.id, userId))

	return db.query.users.findFirst({
		where: eq(users.id, userId),
	})
}
`

export default tmpl
