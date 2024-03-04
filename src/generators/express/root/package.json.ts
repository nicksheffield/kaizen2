import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const name = project.project.name.toLowerCase().replace(/\s/, '-')
	const deps: Record<string, string> = {}

	// if (project.database === 'postgres') {
	// 	deps.pg = '^8.11.1'
	// }
	// if (project.database === 'mysql') {
	// 	deps.mysql2 = '^3.6.0'
	// }
	deps.mysql2 = '^3.6.0'

	const packageJson = {
		name,
		version: '1.0.0',
		description: '',
		main: 'index.ts',
		scripts: {
			dev: 'nodemon -r tsconfig-paths/register src/index.ts',
			postinstall: 'patch-package; ts-node -r tsconfig-paths/register src/seed.ts',
		},
		keywords: [],
		author: '',
		license: 'ISC',
		dependencies: {
			'@apollo/server': '^4.9.0',
			bcryptjs: '^2.4.3',
			'class-validator': '^0.14.0',
			cors: '^2.8.5',
			dotenv: '^16.3.1',
			express: '^4.18.2',
			graphql: '^16.7.1',
			jsonwebtoken: '^9.0.1',
			'ns-migrate': '^0.0.21',
			'ns-gql-filters': '0.0.3',
			'reflect-metadata': '^0.1.13',
			'sql-formatter': '^12.2.4',
			'swagger-ui-express': '^4.6.3',
			'type-graphql': '2.0.0-beta.1',
			'type-graphql-dataloader': '^0.5.1',
			typeorm: '^0.3.17',
			zod: '^3.21.4',
			...deps,
		},
		devDependencies: {
			'@types/cors': '^2.8.13',
			'@types/deep-equal': '^1.0.1',
			'@types/express': '^4.17.17',
			'@types/jsonwebtoken': '^9.0.2',
			'@types/node': '^18.17.1',
			'@types/pg': '^8.10.2',
			'@types/swagger-ui-express': '^4.1.3',
			'@types/bcryptjs': '^2.4.2',
			nodemon: '^2.0.22',
			'ts-node': '^10.9.1',
			'tsconfig-paths': '^4.2.0',
			typescript: '^5.1.6',
			'patch-package': '^8.0.0',
		},
	}

	return JSON.stringify(packageJson, null, 4)
}

export default tmpl
