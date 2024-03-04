const tmpl = () => `import 'reflect-metadata'
import { buildSchema } from 'type-graphql/dist/utils'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { Express } from 'express'
import { customAuthChecker } from '~/gql/auth'
import { authMiddleware } from '~/utils/auth'
import { ApolloServerLoaderPlugin } from 'type-graphql-dataloader'
import { initializedOrm } from '~/orm'

const bootstrapGQL = async (app: Express) => {
	const schema = await buildSchema({
		resolvers: [__dirname + '/resolvers/*.ts', __dirname + '/../orm/entities/*.ts'],
		// the types in 2.0.0-beta.1 are incorrect for authChecker
		// @ts-ignore
		authChecker: customAuthChecker,
		// https://github.com/MichalLytek/type-graphql/issues/1443
		validate: { forbidUnknownValues: false },
	})

	// https://github.com/slaypni/type-graphql-dataloader/issues/34
	const connection = await initializedOrm

	const server = new ApolloServer({
		schema,
		introspection: true,
		plugins: [
			ApolloServerLoaderPlugin({
				typeormGetConnection: () => connection,
			}),
		],
	})

	await server.start()

	app.use(
		'/graphql',
		authMiddleware,
		expressMiddleware(server, {
			context: async ({ req }) => {
				const context = {
					req,
					user: req?.user,
				}

				return context
			},
		})
	)
}

export default bootstrapGQL
`

export default tmpl
