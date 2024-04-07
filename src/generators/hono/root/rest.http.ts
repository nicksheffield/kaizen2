// import { ProjectCtx } from '@/generators/hono/types'

// const tmpl = ({ project }: { project: ProjectCtx }) => {
const tmpl = () => {
	const port = 5556

	return `### @name Login
POST http://localhost:${port}/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password",
  "otp": ""
}

### @name Logout
POST http://localhost:${port}/auth/logout

### @name ConfirmAccount
POST http://localhost:${port}/auth/confirm-account
Content-Type: application/json

{
  "code": "12531783",
  "userId": "l5cd2xu73yr6ryd"
}

### @name Setup2FA
POST http://localhost:${port}/auth/setup-twofactor

### @name Confirm2FA
POST http://localhost:${port}/auth/confirm-twofactor

### @name Disable2FA
POST http://localhost:${port}/auth/disable-twofactor

### @name Profile
GET http://localhost:${port}/auth/profile

### @name ResetPassword
POST http://localhost:${port}/auth/reset-password
Content-Type: application/json

{
  "email": "admin@example.com"
}

### @name ResetPasswordWithCode
POST http://localhost:${port}/auth/reset-password/bydmrkqn8u71o6k7qmay17rir4k9nigzrj5kfemt
Content-Type: application/json

{
  "password": "password"
}

### @name GetUsers
GET http://localhost:${port}/api/users

### @name CreateUser
POST http://localhost:${port}/api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "1f64f903"
}`
}

export default tmpl
