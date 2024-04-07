import { ModelCtx } from '../../../contexts'
import { ProjectCtx } from '@/generators/express/types'

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	const settings = project.project

	return `
import { DataSource } from 'typeorm'
import { envData } from '~/env'
${models.map((model) => `import { ${model.entityName} } from './entities/${model.entityName}'`).join('\n')}

export const orm = new DataSource({
	type: 'mysql',
	host: envData.DATABASE_URL,
	port: +envData.DATABASE_PORT,
	username: envData.DATABASE_USERNAME,
	password: envData.DATABASE_PASSWORD,
	database: envData.DATABASE_NAME,
	entities: [${models.map((x) => x.entityName).join(', ')}],
	logging: true,
	connectTimeout: ${settings.connectionTimeout}
})

export const initializedOrm = orm.initialize()

initializedOrm.catch((err) => {
	console.error('Error during Data Source initialization', err)
})
`
}

export default tmpl
