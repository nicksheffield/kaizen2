const tmpl = () => `### @name Login
POST http://localhost:5555/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password",
  "otp": ""
}

### @name Logout
POST http://localhost:5555/auth/logout

### @name ConfirmAccount
POST http://localhost:5555/auth/confirm-account
Content-Type: application/json

{
  "code": "12531783",
  "userId": "l5cd2xu73yr6ryd"
}

### @name Setup2FA
POST http://localhost:5555/auth/setup-twofactor

### @name Confirm2FA
POST http://localhost:5555/auth/confirm-twofactor

### @name Disable2FA
POST http://localhost:5555/auth/disable-twofactor

### @name Profile
GET http://localhost:5555/auth/profile

### @name ResetPassword
POST http://localhost:5555/auth/reset-password
Content-Type: application/json

{
  "email": "admin@example.com"
}

### @name ResetPasswordWithCode
POST http://localhost:5555/auth/reset-password/bydmrkqn8u71o6k7qmay17rir4k9nigzrj5kfemt
Content-Type: application/json

{
  "password": "password"
}

### @name GetUsers
GET http://localhost:5555/api/users

### @name CreateUser
POST http://localhost:5555/api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "1f64f903"
}`

export default tmpl
