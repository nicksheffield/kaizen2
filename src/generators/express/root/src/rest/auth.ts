const tmpl = () => `import express from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '~/orm/entities/User'
import { orm } from '~/orm'
import { generateAccessToken, generateTokens, getExp, validatePassword } from '~/utils/auth'

let refreshTokens: string[] = []

const router = express.Router()

router.post('/login', async (req, res) => {
	const user = await orm.manager.findOne(User, {
		select: ['id', 'name', 'email', 'password'],
		where: { email: req.body.email },
	})

	const passwordIsCorrect = await validatePassword(req.body.password, user?.password || '')

	if (!user || !passwordIsCorrect) {
		res.status(401).send('Invalid credentials')
		return
	}

	const tokens = generateTokens(
		{
			id: user.id,
			name: user.name,
			email: user.email,
		},
		'login'
	)

	refreshTokens.push(tokens.refresh_token)

	res.send(tokens)
})

router.post('/refresh', async (req, res) => {
	const refreshToken = String(req.body.refresh_token)

	if (!refreshToken) return res.sendStatus(401)
	if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(401)
		if (!user) return res.sendStatus(401)

		const parsedUser = z
			.object({
				id: z.string(),
				name: z.string(),
				email: z.string(),
			})
			.parse(user)

		const access_token = generateAccessToken(parsedUser, 'refresh')
		const exp = getExp(access_token)

		res.json({
			access_token,
			exp,
		})
	})
})

router.post('/logout', (req, res) => {
	const token = String(req.body.refresh_token)

	refreshTokens = refreshTokens.filter((t) => t !== token)

	res.sendStatus(204)
})

export default router
`

export default tmpl
