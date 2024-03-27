const tmpl = () => {
	return `import { env } from '@/lib/env.js'
	import { migrate as nsMigrate } from 'ns-migrate'
	import { readFileSync } from 'fs'
	import { fileURLToPath } from 'url'
	import { join } from 'path'
	import path from 'path'
	
	const dirname = path.dirname(fileURLToPath(import.meta.url))
	
	export const migrate = () => {
		return nsMigrate(
			{
				host: env.DB_HOST,
				port: +env.DB_PORT,
				user: env.DB_USER,
				password: env.DB_PASS,
				database: env.DB_NAME,
			},
			JSON.parse(readFileSync(join(dirname, '../schema.json'), 'utf8'))
		)
	}
	
	`
}

export default tmpl
