import { bodyDefToTypeString } from '@/app/projects/[projectId]/rest/utils/fns'
import { BodyDef, endpointQueryParams } from '@/generators/express/utils'
import { TemplateEndpointCtx } from '@/generators/types'

const tmpl = ({ endpoint, models, relations }: TemplateEndpointCtx) => {
	const params = endpoint.path
		.split('/')
		.filter((x) => x.startsWith(':'))
		.map((x) => x.slice(1))

	const queryParams = endpointQueryParams.parse(endpoint.queryParams)

	return `import {
		EndpointHandlerType,
		response,
		getResource,
	} from '~/rest/customEndpoints'
	import { z } from 'zod'

	type EndpointHandler = EndpointHandlerType<
	{
		${params?.map((x) => `${x}: string`).join('\n\t\t')}
	},
	{
		${queryParams.map((x) => `${x.name}: string`).join('\n\t\t')}
	},
	${bodyDefToTypeString(BodyDef.parse(endpoint.body), { models, relations })}
>

	${endpoint.script}
	`
}

export default tmpl
