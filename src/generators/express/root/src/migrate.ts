const tmpl = () => `import { envData } from '~/env'
import { migrate as nsMigrate } from 'ns-migrate'
import { readFileSync } from 'fs'
import { join } from 'path'

export const migrate = () => {
	return nsMigrate(
		'mysql',
		{
			host: envData.DATABASE_URL,
			port: +envData.DATABASE_PORT,
			user: envData.DATABASE_USERNAME,
			password: envData.DATABASE_PASSWORD,
			database: envData.DATABASE_NAME,
		},
		JSON.parse(readFileSync(join(__dirname, '../schema.json'), 'utf8'))
	)
}
`

export default tmpl
