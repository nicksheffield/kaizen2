const tmpl = () => `DATABASE_URL=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=

# generate with crypto.randomBytes(64).toString('hex') in js or \`openssl rand -hex 64\` in terminal
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=30m
`

export default tmpl
