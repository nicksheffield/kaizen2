import { Method, type Endpoint } from '@/lib/schemas'
import { BodyDef, bodyDefToZodSchema, camelize, endpointQueryParams } from '../../../../../utils'
import { type TemplateEndpointGroupsCtx } from '@/generators/types'

const sortEndpoints = (endpoints: Endpoint[]) => {
	const sorter = (a: Endpoint, b: Endpoint) => {
		const aParts = a.path.split('/')
		const bParts = b.path.split('/')

		const hasParamA = aParts[aParts.length - 1].startsWith(':')
		const hasParamB = bParts[bParts.length - 1].startsWith(':')

		const aWeight = aParts.length * 1000 + (hasParamA ? 1 : 0)
		const bWeight = bParts.length * 1000 + (hasParamB ? 1 : 0)

		return aWeight - bWeight
	}

	const getEndpoints = endpoints.filter((x) => x.method === Method.GET).sort(sorter)
	const postEndpoints = endpoints.filter((x) => x.method === Method.POST).sort(sorter)
	const putEndpoints = endpoints.filter((x) => x.method === Method.PUT).sort(sorter)
	const deleteEndpoints = endpoints.filter((x) => x.method === Method.DELETE).sort(sorter)

	return [...getEndpoints, ...postEndpoints, ...putEndpoints, ...deleteEndpoints]
}

const tmpl = ({ group, models, relations }: TemplateEndpointGroupsCtx) => {
	const endpoints = sortEndpoints(group.endpoints)

	return `import express from 'express'
	import { authenticateToken } from '~/utils/auth'
	import { runCustomHandler } from '~/rest/customEndpoints'
	import { z } from 'zod'

	${endpoints.map((x) => `import ${camelize(x.name)} from './${x.name.toLowerCase().replace(/\s/, '-')}'`).join('\n')}

	const router = express.Router()
	
	${endpoints
		.map((endpoint) => {
			const params = endpoint.path
				.split('/')
				.filter((x) => x.startsWith(':'))
				.map((x) => x.slice(1))

			const queryParams = endpointQueryParams.parse(endpoint.queryParams)

			const bodyParams = bodyDefToZodSchema(BodyDef.parse(endpoint.body), { models, relations })

			return `
					router.${endpoint.method.toLowerCase()}('${endpoint.path}', authenticateToken, (req, res) => {
						${
							params.length
								? `
							const paramsSchema = z.object({
								${params.map((x) => `${x}: z.string(),`).join('\n\t\t\t\t\t')}
							})
						`
								: ''
						}

						${
							queryParams.length
								? `
							const querySchema = z.object({
								${queryParams.map((x) => `${x.name}: z.string().optional(),`).join('\n\t\t\t\t\t')}
							})
						`
								: ''
						}

						${
							bodyParams
								? `
							const bodySchema = ${bodyParams}
						`
								: ''
						}

						runCustomHandler(req, res, ${camelize(endpoint.name)}, {
							${params.length ? 'paramsSchema,' : ''}${queryParams.length ? 'querySchema,' : ''}${
								bodyParams.length ? 'bodySchema,' : ''
							}
						})
					})
				`
		})
		.join('\n\n')}
	
	export default router	
	`
}

export default tmpl
