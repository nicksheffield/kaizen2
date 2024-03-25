const tmpl = () => `import 'dotenv/config'
import { env } from '@/lib/env'

import type { Config } from 'drizzle-kit'

export default {
	schema: './src/schema.ts',
	out: './migrations',
	driver: 'mysql2',
	dbCredentials: {
		host: env.DB_HOST,
		user: env.DB_USER,
		port: +env.DB_PORT,
		password: env.DB_PASS,
		database: env.DB_NAME,
	},
} satisfies Config
`

export default tmpl
