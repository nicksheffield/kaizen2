import { ExpressGeneratorFn } from './types'
import { format } from './utils'
import { createModelCtx } from './contexts'

import { default as env } from './root/env'
import { default as dockerCompose } from './root/docker-compose'
import { default as envExample } from './root/env.example'
import { default as gitignore } from './root/.gitignore'
import { default as prettierRc } from './root/.prettierrc'
import { default as packageJson } from './root/package.json'
import { default as tsconfigJson } from './root/tsconfig.json'
import { default as schemaJson } from './root/schema.json'
import { default as restHttp } from './root/rest.http'
import { default as typeGraphQlDataloader051Patch } from './root/patches/type-graphql-dataloader+0.5.1.patch'
import { default as src_index } from './root/src/index'
import { default as src_api } from './root/src/api'
import { default as src_env } from './root/src/env'
import { default as src_migrate } from './root/src/migrate'
import { default as src_seed } from './root/src/seed'
import { default as src_orm_index } from './root/src/orm/index'
import { default as src_orm_entities_entity } from './root/src/orm/entities/entity'
import { default as src_utils_auth } from './root/src/utils/auth'
import { default as src_gql_auth } from './root/src/gql/auth'
import { default as src_gql_index } from './root/src/gql/index'
import { default as src_gql_resolvers_misc } from './root/src/gql/resolvers/_misc'
import { default as src_gql_resolvers_resolver } from './root/src/gql/resolvers/resolver'
import { default as src_rest_index } from './root/src/rest/index'
import { default as src_rest_auth } from './root/src/rest/auth'
// import { default as src_rest_customEndpoints } from './root/src/rest/customEndpoints'
// import { default as src_rest_api_group_index } from './root/src/rest/api/group/index'
// import { default as src_rest_api_group_endpoint } from './root/src/rest/api/group/endpoint'

export const generate: ExpressGeneratorFn = async (project) => {
	const models = project.models.map((model) => createModelCtx(model, project))

	// const gqlEnabled = project.gqlEnabled

	// const restEnabled =
	// 	project.restEnabled &&
	// 	project.endpointGroups.length > 0 &&
	// 	project.endpointGroups.flatMap((x) => x.endpoints).length > 0

	const gqlEnabled = true
	const restEnabled = true

	const dir: Record<string, string> = {}

	// handle root dir
	dir['/.env.example'] = envExample()
	dir['/.env'] = env({ project })
	dir['/.gitignore'] = gitignore()
	dir['/.pretterrc'] = prettierRc()
	dir['/docker-compose.yml'] = dockerCompose({ project })
	dir['/package.json'] = packageJson({ project })
	dir['/tsconfig.json'] = tsconfigJson()
	dir['/schema.json'] = schemaJson({ models, project })
	dir['/rest.http'] = restHttp({ models })

	// handle patches dir
	dir['/patches/type-graphql-dataloader+0.5.1.patch'] = typeGraphQlDataloader051Patch()

	// handle src dir
	dir['/src/index.ts'] = await format(src_index({ apiEnabled: restEnabled || gqlEnabled }))
	dir['/src/api.ts'] = await format(src_api({ project }))
	dir['/src/env.ts'] = await format(src_env())
	dir['/src/migrate.ts'] = await format(src_migrate())
	dir['/src/seed.ts'] = await format(src_seed())

	// handle orm dir
	dir['/src/orm/index.ts'] = await format(src_orm_index({ models, project }))
	for (const model of models) {
		dir[`/src/orm/entities/${model.entityName}.ts`] = await format(src_orm_entities_entity({ model }))
	}

	// handle utils dir
	dir['/src/utils/auth.ts'] = await format(src_utils_auth())

	// handle gql dir
	if (gqlEnabled) {
		dir['/src/gql/index.ts'] = await format(src_gql_index())
		dir['/src/gql/auth.ts'] = await format(src_gql_auth())
		dir['/src/gql/resolvers/_misc.ts'] = await format(src_gql_resolvers_misc())
		for (const model of models) {
			dir[`/src/gql/resolvers/${model.gqlTypeName}.ts`] = await format(src_gql_resolvers_resolver({ model }))
		}
	}

	// handle auth
	dir['/src/rest/auth.ts'] = await format(src_rest_auth())

	// handle rest dir
	if (restEnabled) {
		dir['/src/rest/index.ts'] = await format(src_rest_index())
		// dir['/src/rest/customEndpoints.ts'] = await format(src_rest_customEndpoints())

		// for (const group of project.endpointGroups) {
		// 	if (group.endpoints.length === 0) continue
		// 	dir[`/src/rest/api/${group.name}/index.ts`] = await format(
		// 		src_rest_api_group_index({ group, models: project.models, relations: project.relations }) // update me
		// 	)

		// 	for (const endpoint of group.endpoints) {
		// 		dir[`/src/rest/api/${group.name}/${endpoint.name.toLowerCase().replace(/\s/, '-')}.ts`] = await format(
		// 			src_rest_api_group_endpoint({ endpoint, models: project.models, relations: project.relations }) // update me
		// 		)
		// 	}
		// }
	}

	return dir
}
