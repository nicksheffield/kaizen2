import { getSettings } from '@/generators/express/utils'
import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const settings = getSettings(project)

	return `
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import bootstrapGQL from './gql'

const port = +(process.env.PORT || 8000)
const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use((req, res, next) => {
	express.json({ limit: '${settings.maxBody}' })(req, res, (err) => {
		if (err) {
			return res.sendStatus(400) // Bad request
		}

		next()
	})
})
app.use(express.urlencoded({ extended: false }))

app.use('/auth', require('./rest/auth').default)

${project.restEnabled ? `app.use(require('./rest').default)` : ''}

app.use(
	(error: any, request: Request, response: Response, next: NextFunction) => {
		console.log(\`error \${error.message}\`)
		const status = error.status || 400
		response.status(status).send(error.message)
	}
)

${project.gqlEnabled ? `bootstrapGQL(app).then(() => {` : ''}
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
${project.gqlEnabled ? `})` : ''}

const run = () => {
	app.listen(port, () => {
		console.log(\`Server listening on port \${port}\`)
	})
}

export default run
`
}

export default tmpl
