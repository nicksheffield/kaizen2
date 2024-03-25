import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const settings = project.project
	const secrets = project.env

	if (!secrets) return ''

	return `DOMAINS=www.${settings.domainName},${settings.domainName}
PORT=5556

# database connection
DB_HOST=localhost
DB_PORT=3307
DB_USER=${secrets.MYSQL_USER}
DB_PASS=${secrets.MYSQL_PASSWORD}
DB_NAME=db

# email configuration
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=5df2197c6986f5
EMAIL_PASS=8ee4c83e163439
EMAIL_FROM=noreply@kz.com
`
}

export default tmpl
