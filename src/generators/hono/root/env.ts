import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const settings = project.project
	const secrets = project.env

	if (!secrets) return ''

	return `DOMAINS=www.${settings.domainName},${settings.domainName}
PORT=5556

# database connection
DB_URI=mysql://${secrets.MYSQL_USER}@localhost:3308?password=${secrets.MYSQL_PASSWORD}&database=db

# email configuration
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=5df2197c6986f5
EMAIL_PASS=8ee4c83e163439
EMAIL_FROM=noreply@kz.com
`
}

export default tmpl
