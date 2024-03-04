const tmpl = () => `import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User as UserModel } from '~/orm/entities/User'
import { z } from 'zod'
import { hash, compare } from 'bcryptjs'

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string
				name: string
				email: string
			}
		}
	}
}

type AccessTokenGenerationType = 'login' | 'refresh'

export const authUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
})

export type AuthUser = z.infer<typeof authUserSchema>

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
		if (err) {
			return res.sendStatus(401)
		}

		try {
			req.user = authUserSchema.parse(user)

			next()
		} catch (error) {
			console.log('error', error)
			res.sendStatus(403)
		}
	})
}

type SimplifiedUser = Pick<UserModel, 'name' | 'email'> & {
	id: string
}

export const generateAccessToken = (user: SimplifiedUser, type: AccessTokenGenerationType) => {
	return jwt.sign(
		{
			sub: user.id,
			via: type,
			...user,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		}
	)
}

export const generateRefreshToken = (user: SimplifiedUser) => {
	return jwt.sign(
		{
			sub: user.id,
			...user,
		},
		process.env.REFRESH_TOKEN_SECRET
	)
}

export const getExp = (token: string) => {
	const { exp } = jwt.decode(token) as JwtPayload

	return exp
}

export const generateTokens = (user: SimplifiedUser, type: AccessTokenGenerationType) => {
	const access_token = generateAccessToken(user, type)
	const refresh_token = generateRefreshToken(user)
	const exp = getExp(access_token)
	return { access_token, refresh_token, exp }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (req.headers.authorization) {
		const token = req.headers.authorization.split(' ')[1]

		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
			if (err) {
				res.status(401).json({ message: 'Unauthorized' })
			} else {
				req.user = authUserSchema.parse(decoded)

				next()
			}
		})
	} else {
		next()
	}
}

export const hashPassword = (password: string) => hash(password, 10)
export const validatePassword = (password: string, hash: string) => compare(password, hash)
`

export default tmpl
