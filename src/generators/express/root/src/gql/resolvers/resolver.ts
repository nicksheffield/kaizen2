import { AttributeType } from '@/lib/projectSchemas'
import { ModelCtx } from '../../../../contexts'
import { plural } from 'pluralize'

const tmpl = ({ model }: { model: ModelCtx }) => {
	return `
	import {
		Arg,
		Args,
		ArgsType,
		Authorized,
		Field,
		ID,
		InputType,
		Int,
		Float,
		Mutation,
		ObjectType,
		Query,
		Resolver,
	} from 'type-graphql'
	import { Max, Min } from 'class-validator'
	import { orm } from '~/orm'
	import { ${model.entityName} } from '~/orm/entities/${model.entityName}'
	${model.relatedModels
		.map((model) => `import { ${model.entityName} } from '~/orm/entities/${model.entityName}'`)
		.join('\n')}
	${model.name === 'User' ? `import { hashPassword } from '~/utils/auth'` : ''}
	
	import * as filters from 'ns-gql-filters'
	import { OrderByInput } from '~/gql/resolvers/_misc'
	
	@ObjectType()
	export class ${model.gqlTypeName}Collection {
		@Field((type) => [${model.gqlTypeName}])
		items!: ${model.gqlTypeName}[]
	
		@Field()
		page!: number
	
		@Field()
		limit!: number
	
		@Field()
		itemCount!: number
	
		@Field()
		totalCount!: number
	
		@Field()
		totalPages!: number
	}
	
	@InputType()
	export class Create${model.gqlTypeName}Input {
		${model.attributes
			.map((attr) => {
				const type =
					attr.name === 'id' ? '(type) => ID' : attr.type === AttributeType.float ? `(type) => Float` : ''
				const optional = attr.optional || attr.name === 'id' ? '{ nullable: true }' : ''

				return `
						@Field(${type}${type && optional ? ', ' : ''}${optional})
						${attr.name}${attr.name === 'id' ? '?' : attr.optionalOp}: ${attr.jsType}
					`
			})
			.join('\n')}

		${model.foreignKeys
			.map(
				(fk) => `
					@Field(${fk.optional ? '{ nullable: true }' : ''})
					${fk.name}${fk.optionalOp}: string
				`
			)
			.join('\n')}
	}

	@ArgsType()
	class Create${plural(model.gqlTypeName)}Args {
		@Field((type) => [Create${model.gqlTypeName}Input])
		${model.many}!: Create${model.gqlTypeName}Input[]
	}
	
	@InputType()
	export class Update${model.gqlTypeName}Input {
		${model.attributes
			.map((attr) => {
				const type =
					attr.name === 'id' ? '(type) => ID' : attr.type === AttributeType.float ? `(type) => Float` : ''
				const optional = attr.name !== 'id' ? '{ nullable: true }' : ''

				return `
						@Field(${type}${type && optional ? ', ' : ''}${optional})
						${attr.name}${attr.name === 'id' ? '!' : '?'}: ${attr.jsType}
					`
			})
			.join('\n')}

		${model.foreignKeys
			.map(
				(fk) => `
					@Field({ nullable: true })
					${fk.name}?: string
				`
			)
			.join('\n')}
	}

	@ArgsType()
	class Update${plural(model.gqlTypeName)}Args {
		@Field((type) => [Update${model.gqlTypeName}Input])
		${model.many}!: Update${model.gqlTypeName}Input[]
	}
	
	@InputType()
	export class ${model.gqlTypeName}SearchInput {
		${model.attributes
			.filter((x) => x.selectable)
			.map(
				(attr) => `
					@Field((type) => filters.${attr.gqlFilter}, { nullable: true })
					${attr.name}?: filters.${attr.gqlFilter}
				`
			)
			.join('\n')}

		${model.foreignKeys
			.map(
				(fk) => `
					@Field((type) => filters.StringFilterInput, { nullable: true })
					${fk.name}?: filters.StringFilterInput
				`
			)
			.join('\n')}
	
		${
			model.auditDates
				? `
					@Field((type) => filters.NumberFilterInput, { nullable: true })
					createdAt?: filters.NumberFilterInput
				
					@Field((type) => filters.NumberFilterInput, { nullable: true })
					updatedAt?: filters.NumberFilterInput
				
					@Field((type) => filters.NumberFilterInput, { nullable: true })
					deletedAt?: filters.NumberFilterInput
				`
				: ''
		}

		@Field((type) => [${model.gqlTypeName}SearchInput], { nullable: true })
		and?: ${model.gqlTypeName}SearchInput[]

		@Field((type) => [${model.gqlTypeName}SearchInput], { nullable: true })
		or?: ${model.gqlTypeName}SearchInput[]
	}
	
	@ArgsType()
	export class ${model.gqlTypeName}Args {
		@Field((type) => Int)
		@Min(1)
		page: number = 1
	
		@Field((type) => Int)
		@Min(1)
		@Max(100)
		limit: number = 10
	
		@Field((type) => ${model.gqlTypeName}SearchInput, { nullable: true })
		search?: ${model.gqlTypeName}SearchInput

		@Field((type) => [OrderByInput], { nullable: true })
		orderBy?: OrderByInput[]
	}
	
	@ArgsType()
	export class DeleteArgs {
		@Field((type) => ID)
		id!: string
	
		@Field((type) => Boolean, { nullable: true })
		soft?: boolean
	}

	@ArgsType()
	export class BulkDeleteArgs {
		@Field((type) => [ID])
		ids!: string[]
	
		@Field((type) => Boolean, { nullable: true })
		soft?: boolean
	}
	
	@Resolver(${model.gqlTypeName})
	export default class ${model.gqlTypeName}Resolver {
		@Authorized()
		@Query((returns) => ${model.gqlTypeName})
		async ${model.single}(@Arg('id', (type) => ID) id: string) {
			const item = await orm.manager.findOneBy(${model.entityName}, { id })
	
			if (!item) throw new Error('Not found')
	
			return item
		}
	
		@Authorized()
		@Query((returns) => ${model.gqlTypeName}Collection)
		async ${model.many}(@Args() { page, limit, search, orderBy }: ${model.gqlTypeName}Args) {
			let query = orm.getRepository(${model.entityName}).createQueryBuilder().select('*')
	
			query = search ? filters.handleSearch(search, query) : query

			if (orderBy) {
				for (let i = 0; i < orderBy.length; i++) {
					const sort = orderBy[i]
	
					if (i === 0) {
						query = query.orderBy(sort.field, sort.dir || 'ASC')
					} else {
						query = query.addOrderBy(sort.field, sort.dir || 'ASC')
					}
				}
			}
	
			let itemsQ = query
				.clone()
				.take(limit)
				.skip((page - 1) * limit)
	
			const items = (await itemsQ.getRawMany()) as ${model.entityName}[]
			const totalCount = await query.getCount()
	
			return {
				items,
				page,
				limit,
				itemCount: items.length,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
			}
		}

		async new${model.gqlTypeName}(${model.single}: Create${model.gqlTypeName}Input): Promise<${model.entityName}> {
			const item = new ${model.entityName}()

			${model.attributes
				.map(
					(attr) =>
						`${attr.name === 'id' || attr.optional ? `if (${model.single}.${attr.name})` : ''} item.${
							attr.name
						} = ${
							attr.type === 'password'
								? `await hashPassword(${model.single}.${attr.name})`
								: `${model.single}.${attr.name}`
						}`
				)
				.join('\n')}
			${model.foreignKeys
				.map(
					(fk) =>
						`${fk.optional ? `if (${model.single}.${fk.name})` : ''} item.${fk.name} = ${model.single}.${
							fk.name
						}`
				)
				.join('\n')}

			return item
		}
	
		@Authorized()
		@Mutation((returns) => ${model.gqlTypeName})
		async create${model.gqlTypeName}(@Arg('${model.single}') ${model.single}: Create${model.gqlTypeName}Input): Promise<${
			model.entityName
		}> {
			const item = await this.new${model.gqlTypeName}(${model.single})

			const result = await orm.manager.save(item)
	
			return result
		}

		@Authorized()
		@Mutation((returns) => [${model.gqlTypeName}])
		async create${plural(model.gqlTypeName)}(@Args() { ${model.many} }: Create${plural(model.gqlTypeName)}Args): Promise<${
			model.entityName
		}[]> {
			let itemsToInsert: ${model.entityName}[] = []

			for (const ${model.single} of ${model.many}) {
				const item = await this.new${model.gqlTypeName}(${model.single})
				itemsToInsert.push(item)
			}

			const result = await orm.manager.save(itemsToInsert)

			return result
		}
	
		@Authorized()
		@Mutation((returns) => ${model.gqlTypeName})
		async update${model.gqlTypeName}(@Arg('${model.single}') ${model.single}: Update${model.gqlTypeName}Input): Promise<${
			model.entityName
		}> {
			const item = await orm.manager.findOneBy(${model.entityName}, { id: ${model.single}.id })
	
			if (!item) throw new Error('Not found')

			${model.attributes
				.filter((x) => x.name !== 'id')
				.map(
					(attr) =>
						`if (${model.single}.${attr.name} !== undefined) item.${attr.name} = ${
							attr.type === 'password'
								? `await hashPassword(${model.single}.${attr.name})`
								: `${model.single}.${attr.name}`
						}`
				)
				.join('\n')}
			${model.foreignKeys
				.map(
					(fk) => `if (${model.single}.${fk.name} !== undefined) item.${fk.name} = ${model.single}.${fk.name}`
				)
				.join('\n')}
	
			const result = await orm.manager.save(item)
	
			return result
		}

		@Authorized()
		@Mutation((returns) => [${model.gqlTypeName}])
		async update${plural(model.gqlTypeName)}(@Args() { ${model.many} }: Update${plural(model.gqlTypeName)}Args): Promise<${
			model.entityName
		}[]> {
			const outputs: ${model.entityName}[] = []

			for (const ${model.single} of ${model.many}) {
				const result = await this.update${model.gqlTypeName}(${model.single})
				outputs.push(result)
			}

			return outputs
		}
	
		@Authorized()
		@Mutation((returns) => Boolean)
		async delete${model.gqlTypeName}(@Args() { id, soft = true }: DeleteArgs) {
			if (soft) {
				await orm.manager.softDelete(${model.entityName}, { id })
	
				return true
			} else {
				await orm.manager.delete(${model.entityName}, { id })
	
				return true
			}
		}

		@Authorized()
		@Mutation((returns) => Boolean)
		async delete${plural(model.gqlTypeName)}(@Args() { ids, soft = true }: BulkDeleteArgs) {
			let result = true

			for (const id of ids) {
				result = result && (await this.delete${model.gqlTypeName}({ id, soft }))
			}

			return result
		}
	}
	
	`
}

export default tmpl
