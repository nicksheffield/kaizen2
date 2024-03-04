const tmpl = () => `
import { Field, InputType, registerEnumType } from 'type-graphql'

export enum OrderDir {
	ASC = 'ASC',
	DESC = 'DESC',
}

registerEnumType(OrderDir, {
	name: 'OrderDir',
	description: 'Order-by direction',
})

@InputType()
export class OrderByInput {
	@Field((type) => String, { nullable: true })
	field!: string

	@Field((type) => OrderDir, { nullable: true })
	dir?: OrderDir
}
`

export default tmpl
