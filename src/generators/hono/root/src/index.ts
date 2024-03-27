const tmpl = () => {
	return `import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { mountRoutes } from '@/lib/mountRoutes.js'
import { join } from 'path'
import { showRoutes } from 'hono/dev'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { seed } from '@/seed.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from '@/lib/env.js'

const app = new Hono()

seed()

app.use(
	cors({
		// @TODO: Change this to use an the actual origin in prod. x=>x is fine for dev
		origin: (x) => x,
		credentials: true,
	})
)

app.use(
	secureHeaders({
		xFrameOptions: false,
		xXssProtection: false,
	})
)

const dirname = path.dirname(fileURLToPath(import.meta.url))
mountRoutes('', join(dirname, 'routes')).then((router) => {
	app.route('/', router)

	if (process.env.NODE_ENV !== 'production') showRoutes(app)
})

serve({
	port: +(env.PORT || 5000),
	fetch: app.fetch,
})

process.on('uncaughtException', (error) => {
	if (error.name === 'AbortError') return

	console.log(error)
	process.exit(1)
})
`
}

export default tmpl
