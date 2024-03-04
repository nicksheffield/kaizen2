import { SettingType } from '@/lib/schemas'
import { getSettingsOfType } from '@/generators/express/utils'
import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const settings = getSettingsOfType(SettingType.setting, project)
	const secrets = getSettingsOfType(SettingType.secret, project)

	return `DOMAINS=www.${settings.domain},${settings.domain}

DATABASE_URL=db
DATABASE_PORT=3306
DATABASE_USERNAME=${secrets.MYSQL_USER}
DATABASE_PASSWORD=${secrets.MYSQL_PASSWORD}
DATABASE_NAME=db

ACCESS_TOKEN_SECRET=${secrets.ACCESS_TOKEN_SECRET}
REFRESH_TOKEN_SECRET=${secrets.REFRESH_TOKEN_SECRET}
ACCESS_TOKEN_EXPIRY=30m
`
}

export default tmpl
