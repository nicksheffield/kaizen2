import { ModelCtx } from '@/generators/hono/contexts'

const tmpl = (ctx: { models: ModelCtx[] }) => {
	const models = ctx.models

	return `import { Context, Hono } from 'hono'
import { g, InferResolvers, buildSchema } from 'garph'
import { createYoga } from 'graphql-yoga'
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection'
import { authenticate } from '@/middleware/authenticate.js'
import { User as AuthUser, Session } from 'lucia'
import { env } from '@/lib/env.js'
import { isNotFalse, writeIntrospection } from '@/lib/utils.js'
${models.map((model) => `import * as ${model.name} from './resolvers/${model.tableName}.js'`).join('\n')}

const isDev = env.NODE_ENV !== 'production'

export const router = new Hono()

const Query = g.type('Query', {
	${models.map((model) => `...${model.name}.queryTypes`).join(',\n\t')}
})

const Mutation = g.type('Mutation', {
	${models.map((model) => `...${model.name}.mutationTypes`).join(',\n\t')}
})

// https://github.com/stepci/garph/issues/83
export type Resolvers = InferResolvers<
	{
		Query: typeof Query
		Mutation: typeof Mutation
		${models.map((model) => `${model.name}: typeof ${model.name}.types.type`).join(',\n\t')}
	},
	{
		context: Context<{
			Variables: {
				user: AuthUser
				session: Session
			}
		}>
	}
>

const resolvers = {
	Query: {
		${models.map((model) => `...${model.name}.queryResolvers`).join(',\n\t')}
	},
	Mutation: {
		${models.map((model) => `...${model.name}.mutationResolvers`).join(',\n\t')}
	},
	${models.map((model) => `${model.name}: ${model.name}.fieldResolvers`).join(',\n\t')}
}

const schema = buildSchema({ g, resolvers })

writeIntrospection(schema)

const yoga = createYoga({
	schema,
	graphiql: false,
	plugins: [!isDev && useDisableIntrospection].filter(isNotFalse),
})

const methods = isDev ? ['GET', 'POST'] : ['POST']

router.on(methods, '/', authenticate, async (context) => {
	return yoga.handle(context.req.raw, context)
})
`
}

export default tmpl
