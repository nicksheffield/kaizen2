const tmpl = () => `import express from 'express'
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
// import { createSwaggerDoc } from '~/utils/swaggerDoc'

const router = express.Router()

// Dynamically load all routes in the api directory
const folders = fs
	.readdirSync(__dirname + '/api')
	.filter((file) => file !== 'index.ts')

for (const folder of folders) {
	const name = folder.replace('.ts', '')
	router.use('/api', require(\`./api/\${name}\`).default)
}

// createSwaggerDoc().then((doc) => {
// 	router.use(
// 		'/api',
// 		swaggerUi.serve,
// 		swaggerUi.setup(doc, {
// 			swaggerUrl: '/',
// 		})
// 	)
// })

export default router
`

export default tmpl
