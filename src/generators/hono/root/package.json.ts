import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const name = project.project.name.toLowerCase().replace(/\s/, '-')

	const packageJson = {
		name,
		main: 'index.ts',
		type: 'module',
		scripts: {
			dev: 'tsx --watch src/index.ts',
			migrate: 'npx drizzle-kit generate:mysql',
			studio: 'npx drizzle-kit studio',
		},
		peerDependencies: {
			typescript: '^5.0.0',
		},
		dependencies: {
			'@envelop/graphql-middleware': '^6.0.0',
			'@escape.tech/graphql-armor': '^2.4.0',
			'@graphql-yoga/plugin-disable-introspection': '^2.2.0',
			'@hono/node-server': '^1.8.2',
			'@hono/zod-validator': '^0.2.0',
			'@lucia-auth/adapter-drizzle': '^1.0.3',
			'date-fns': '^3.3.1',
			dotenv: '^16.4.5',
			'drizzle-kit': '^0.20.14',
			'drizzle-orm': '^0.30.1',
			garph: '^0.6.8',
			graphql: '^16.8.1',
			'graphql-shield': '^7.6.5',
			'graphql-yoga': '^5.1.1',
			hono: '^4.0.10',
			lucia: '^3.1.1',
			mysql2: '^3.9.2',
			nodemailer: '^6.9.12',
			'ns-migrate': '^0.1.0',
			'ohm-js': '^17.1.0',
			oslo: '^1.1.3',
			ramda: '^0.29.1',
			tsx: '^4.7.1',
			zod: '^3.22.4',
			zxcvbn: '^4.4.2',
		},
		devDependencies: {
			'@types/bun': 'latest',
			'@types/nodemailer': '^6.4.14',
			'@types/ramda': '^0.29.11',
			'@types/zxcvbn': '^4.4.4',
			nodemon: '^3.1.0',
			'ts-node': '^10.9.2',
			'tsconfig-paths': '^4.2.0',
		},
	}

	return JSON.stringify(packageJson, null, 4)
}

export default tmpl
