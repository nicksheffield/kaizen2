import { ProjectCtx } from '@/generators/express/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const settings = project.project

	return `
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import bootstrapGQL from './gql'

const port = +(process.env.PORT || 8000)
const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use((req, res, next) => {
	express.json({ limit: '${settings.maxBodySize}' })(req, res, (err) => {
		if (err) {
			return res.sendStatus(400) // Bad request
		}

		next()
	})
})
app.use(express.urlencoded({ extended: false }))

app.use('/auth', require('./rest/auth').default)

${true ? `app.use(require('./rest').default)` : ''}

app.use(
	(error: any, request: Request, response: Response, next: NextFunction) => {
		console.log(\`error \${error.message}\`)
		const status = error.status || 400
		response.status(status).send(error.message)
	}
)

${true ? `bootstrapGQL(app).then(() => {` : ''}
	app.use('*', (_, res) => {
		res.status(404).json({
			success: 'false',
			message: 'Page not found',
			error: {
				statusCode: 404,
				message: 'You reached a route that is not defined on this server',
			},
		})
	})
${true ? `})` : ''}

const run = () => {
	app.listen(port, () => {
		console.log(\`Server listening on port \${port}\`)
	})
}

export default run
`
}

export default tmpl
