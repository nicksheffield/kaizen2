const tmpl = () => `import { env } from '@/lib/env.js'
import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
	host: env.EMAIL_HOST,
	port: +env.EMAIL_PORT,
	auth: {
		user: env.EMAIL_USER,
		pass: env.EMAIL_PASS,
	},
})

export const send = (address: string, subject: string, body: string) => {
	try {
		return transport.sendMail({
			from: env.EMAIL_FROM,
			to: address,
			subject,
			html: body,
		})
	} catch (error) {
		console.log(error)
	}
}

export const sendVerificationEmail = async (
	email: string,
	userId: string,
	code: string
) => {
	await send(
		email,
		'Verify your email',
		\`Your verification code is: \${code}. Enter it <a href="http://localhost:5175/confirm-account?userId=\${userId}">here</a>.\`
	)
}

export const sendPasswordResetToken = async (email: string, code: string) => {
	await send(
		email,
		'Reset your password',
		\`Enter your new password <a href="http://localhost:5175/reset-password?code=\${code}">here</a>.\`
	)
}
`

export default tmpl
