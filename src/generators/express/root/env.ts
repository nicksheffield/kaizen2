import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const settings = project.project
	const secrets = project.env

	if (!secrets) return ''

	return `DOMAINS=www.${settings.domainName},${settings.domainName}

DATABASE_URL=localhost
DATABASE_PORT=3307
DATABASE_USERNAME=${secrets.MYSQL_USER}
DATABASE_PASSWORD=${secrets.MYSQL_PASSWORD}
DATABASE_NAME=db

ACCESS_TOKEN_SECRET=${secrets.ACCESS_TOKEN_SECRET}
REFRESH_TOKEN_SECRET=${secrets.REFRESH_TOKEN_SECRET}
ACCESS_TOKEN_EXPIRY=30m
`
}

export default tmpl
