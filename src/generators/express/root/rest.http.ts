import { ModelCtx } from '../contexts'
import { plural, singular } from 'pluralize'

const tmpl = ({ models }: { models: ModelCtx[] }) => `
### Login
# @name login
POST http://localhost:8000/auth/login
content-type: application/json

{
	"email": "admin@example.com",
	"password": "letmein"
}

###


@access_token={{login.response.body.access_token}}
@refresh_token={{login.response.body.refresh_token}}


### Refresh
# @name refresh
POST http://localhost:8000/auth/refresh
content-type: application/json

{
	"refresh_token": "{{refresh_token}}"
}

### Logout
POST http://localhost:8000/auth/logout
content-type: application/json

{
	"refresh_token": "{{refresh_token}}"
}

${models
	.map((model) => {
		const attrLines = [
			...model.attributes
				.filter((x) => x.name !== 'id')
				.map((attr) => {
					let value = '"value"'
					if (attr.type === 'int') value = '1'
					if (attr.type === 'float') value = '1.0'
					if (attr.type === 'boolean') value = 'true'
					if (attr.type === 'date') value = '"2023-01-01"'
					if (attr.type === 'time') value = '"00:00"'
					if (attr.type === 'datetime') value = '"2023-01-01T00:00:00.000Z"'

					return `"${attr.name}": ${value}`
				}),
			...model.foreignKeys.map((fk) => {
				return `"${fk.name}": "00000000-0000-0000-0000-000000000000"`
			}),
		]

		return `
##--------------------------------------------------------

### GET ${plural(model.name)}
GET http://localhost:8000/api/${model.endpointName}
Authorization: Bearer {{access_token}}

### GET ${singular(model.name)}
GET http://localhost:8000/api/${model.endpointName}/00000000-0000-0000-0000-000000000000
Authorization: Bearer {{access_token}}

### CREATE ${singular(model.name)}
POST http://localhost:8000/api/${model.endpointName}
Authorization: Bearer {{access_token}}
content-type: application/json

{
	${attrLines.join(',\n\t')}
}

### UPDATE ${singular(model.name)}
PUT http://localhost:8000/api/${model.endpointName}/00000000-0000-0000-0000-000000000000
Authorization: Bearer {{access_token}}
content-type: application/json

{
	${attrLines.join(',\n\t')}
}

### DELETE ${singular(model.name)}
DELETE http://localhost:8000/api/${model.endpointName}/00000000-0000-0000-0000-000000000000
Authorization: Bearer {{access_token}}
content-type: application/json

`
	})
	.join('\n')}
`

export default tmpl
