import { ModelCtx } from '@/generators/hono/contexts'
import { mapAttrToGQLFilter, mapAttrToGarph } from '@/generators/hono/utils'
import { ProjectCtx } from '@/generators/types'
import { isNotNone } from '@/lib/utils'
import { plural } from 'pluralize'

const tmpl = ({ model, project }: { model: ModelCtx; project: ProjectCtx }) => {
	const nonSelectAttrs = model.attributes.filter((x) => !x.selectable)

	const isUserModel = project.project.userModelId === model.id

	return `import { db } from '@/lib/db.js'
	import { Resolvers } from '@/routes/graphql/router.js'
	import * as tables from '@/schema.js'
	import {
		asc,
		desc,
		count,
		eq,
		inArray,
		Column,
		and,
		isNull,
	} from 'drizzle-orm'
	import { g, Infer } from 'garph'
	import { generateId } from 'lucia'
	${isUserModel ? `import { createUser, updateUser } from '@/lib/manageUser.js'` : ''}
	${model.relatedModels
		.map((x) => {
			return `import * as ${x.otherModel.name} from './${x.tableName}.js'`
		})
		.join('\n')}
	import { removeDuplicates } from '@/lib/utils.js'
	import { OrderDir, DateType } from './_utils.js'
	import { handleFilters, BooleanFilter, StringFilter, NumberFilter } from './_filters.js'
	
	const OrderBys = g.enumType('${model.name}OrderBy', [
		${model.attributes.map((x) => `'${x.name}'`).join(',')}
		${model.auditDates ? `,'createdAt', 'updatedAt', 'deletedAt'` : ''}
	] as const)
	
	// define the main type and its input types
	export const types = {
		type: g.type('${model.name}', {
			${model.attributes
				.map((x) => {
					if (!x.selectable) return null

					return `${x.name}: g.${mapAttrToGarph(x.type)}${x.optional ? '.optional()' : ''},`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.foreignKeys
				.map((x) => {
					// use id or string? lets go with id for now
					return `${x.name}: g.id()${x.optional ? '.optional()' : ''},`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.relatedModels
				.map((x) => {
					// use id or string? lets go with id for now
					return `${x.fieldName}: g.ref(() => ${x.otherModel.name}.types.type)${x.isArray ? '.list()' : ''}.omitResolver(),`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.auditDates ? `createdAt: g.ref(DateType), updatedAt: g.ref(DateType).optional(), deletedAt: g.ref(DateType).optional(),` : ''}
		}),
	
		collection: g.type('${model.name}Collection', {
			items: g.ref(() => types.type).list(),
			totalCount: g.int(),
		}),
	
		create: g.inputType('Create${model.name}', {
			${model.attributes
				.map((x) => {
					if (!x.insertable) return null

					return `${x.name}: g.${mapAttrToGarph(x.type)}${x.optional || x.name === 'id' ? '.optional()' : ''},`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.foreignKeys
				.map((x) => {
					// use id or string? lets go with id for now
					return `${x.name}: g.id()${x.optional ? '.optional()' : ''},`
				})
				.filter(isNotNone)
				.join('\n')}
		}),
	
		update: g.inputType('Update${model.name}', {
			${model.attributes
				.map((x) => {
					if (x.name === 'id') return null
					if (!x.insertable) return null

					return `${x.name}: g.${mapAttrToGarph(x.type)}.optional(),`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.foreignKeys
				.map((x) => {
					// use id or string? lets go with id for now
					return `${x.name}: g.id().optional(),`
				})
				.filter(isNotNone)
				.join('\n')}
		}),
	
		filter: g.inputType('${model.name}Filter', {
			${model.attributes
				.map((x) => {
					if (!x.selectable) return null

					return `${x.name}: g.ref(${mapAttrToGQLFilter(x.type)}).optional(),`
				})
				.filter(isNotNone)
				.join('\n')}
			${model.foreignKeys
				.map((x) => {
					// use id or string? lets go with id for now
					return `${x.name}: g.ref(StringFilter).optional(),`
				})
				.filter(isNotNone)
				.join('\n')}
			and: g
				.ref(() => types.filter)
				.list()
				.optional(),
			or: g
				.ref(() => types.filter)
				.list()
				.optional(),
		}),
	}
	
	// setup data loaders for relations
	export const fieldResolvers: Resolvers['${model.name}'] = {
		${model.relatedModels
			.map((rel) => {
				let returnStmt = `return queries.map(
					(q) => ${rel.tableName}.${rel.isArray ? 'filter' : 'find'}((u) => u.${rel.oppositeKey} === q.parent.${rel.thisKey})!
				)`

				if (rel.isArray) {
					returnStmt = `return queries.map(
						(q) => ${rel.tableName}.${rel.isArray ? 'filter' : 'find'}((u) => u.${rel.oppositeKey} === q.parent.${rel.thisKey})!
					)`
				}

				return `${rel.fieldName}: {
				async loadBatch(queries) {
					const ${rel.tableName} = await db.query.${rel.tableName}.findMany({
						where: inArray(
							tables.${rel.tableName}.${rel.oppositeKey},
							removeDuplicates(queries.map((q) => q.parent.${rel.thisKey} ?? ''))
						),
					})
		
					${returnStmt}
				},
			}`
			})
			.join(',\n')}
	}
	
	// the types for the queries
	export const queryTypes = {
		${model.name.toLowerCase()}: g.ref(types.type).optional().args({
			id: g.id(),
		}),
	
		${plural(model.name.toLowerCase())}: g.ref(types.collection).args({
			page: g.int().default(1),
			limit: g.int().default(10),
			orderBy: g.ref(OrderBys).default('createdAt'),
			orderDir: g.ref(OrderDir).default('ASC'),
			where: g.ref(types.filter).optional(),
		}),
	}
	
	// the resolvers for the queries
	export const queryResolvers: Resolvers['Query'] = {
		${model.name.toLowerCase()}: async (_, args) => {
			const item = await db.query.${model.tableName}.findFirst({
				${
					nonSelectAttrs.length > 0
						? `columns: {
					${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
					},`
						: ''
				}
				where: and(
					eq(tables.${model.tableName}.id, args.id),
					isNull(tables.${model.tableName}.deletedAt)
				),
			})
	
			// if (!item) return null
			return item
		},
	
		${plural(model.name.toLowerCase())}: async (_, args, c) => {
			const dir = args.orderDir === 'ASC' ? asc : desc
	
			const where = and(
				...handleFilters(tables.${model.tableName}, args.where),
				isNull(tables.${model.tableName}.deletedAt)
			)
	
			const items = await db.query.${model.tableName}.findMany({
				${
					nonSelectAttrs.length > 0
						? `columns: {
					${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
					},`
						: ''
				}
				offset: (args.page - 1) * Math.min(args.limit, 100),
				limit: Math.min(args.limit, 100),
				orderBy: dir(
					tables.${model.tableName}[
						args.orderBy as keyof typeof tables.${model.tableName}
					] as Column
				),
				where,
			})
	
			const [{ totalCount }] = await db
				.select({ totalCount: count() })
				.from(tables.${model.tableName})
				.where(where)
	
			return {
				items,
				totalCount,
			}
		},
	}
	
	// the types for the mutations
	export const mutationTypes = {
		create${model.name}: g
			.ref(types.type)
			.list()
			.optional()
			.args({
				data: g.ref(types.create).list(),
			}),
	
		update${model.name}: g
			.ref(types.type)
			.list()
			.optional()
			.args({
				id: g.id(),
				data: g.ref(types.update).list(),
			}),
	
		delete${model.name}: g
			.ref(types.type)
			.list()
			.args({
				id: g.id().list(),
				softDelete: g.boolean().default(true),
			}),
	}
	
	// the resolvers for the mutations
	export const mutationResolvers: Resolvers['Mutation'] = {
		create${model.name}: async (_, args, c) => {
			const results: Omit<Infer<typeof types.type>, ${model.relatedModels.map((x) => `'${x.fieldName}'`).join('|')}>[] = []
	
			for (const datum of args.data) {
				const { __typename, ...data } = datum

				const { email, password, ...fields} = data

				${
					isUserModel
						? `const item = await createUser(email, password, ...fields)`
						: `const newId = generateId(15)
	
					await db.insert(tables.${model.tableName}).values({
						...data,
						id: data.id ?? newId,
					})
		
					const item = await db.query.${model.tableName}.findFirst({
						${
							nonSelectAttrs.length > 0
								? `columns: {
							${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
							},`
								: ''
						}
						where: eq(tables.${model.tableName}.id, newId),
					})`
				}
	
				if (item) results.push(item)
			}
	
			return results
		},
	
		update${model.name}: async (_, args) => {
			const results: Omit<Infer<typeof types.type>, ${model.relatedModels.map((x) => `'${x.fieldName}'`).join('|')}>[] = []
	
			for (const datum of args.data) {
				const { __typename, ...data } = datum

				const { email, password, ...fields} = data

				${
					isUserModel
						? `await updateUser(
					args.id,
					email ?? undefined,
					password ?? undefined,
					...fields
				)`
						: `await db
				.update(tables.${model.tableName})
				.set({
					${model.attributes
						.map((x) => {
							if (x.name === 'id') return null
							return `${x.name}: data.${x.name} ?? undefined,`
						})
						.filter(isNotNone)
						.join('\n')}
					${model.foreignKeys
						.map((x) => {
							return `${x.name}: data.${x.name} ?? undefined,`
						})
						.join('\n')}
				})
				.where(eq(tables.${model.tableName}.id, args.id))`
				}
	
				const item = await db.query.${model.tableName}.findFirst({
					${
						nonSelectAttrs.length > 0
							? `columns: {
						${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
						},`
							: ''
					}
					where: eq(tables.${model.tableName}.id, args.id),
				})
	
				if (item) results.push(item)
			}
	
			return results
		},
	
		delete${model.name}: async (_, args) => {
			const items = await db.query.${model.tableName}.findMany({
				${
					nonSelectAttrs.length > 0
						? `columns: {
					${nonSelectAttrs.map((x) => `${x.name}: false`).join(',\n')}
					},`
						: ''
				}
				where: inArray(tables.${model.tableName}.id, args.id),
			})
	
			for (const id of args.id) {
				if (args.softDelete) {
					await db.update(tables.${model.tableName}).set({ deletedAt: new Date() }).where(eq(tables.${model.tableName}.id, id))
				} else {
					await db.delete(tables.${model.tableName}).where(eq(tables.${model.tableName}.id, id))
				}
			}
	
			return items
		},
	}
	`
}

export default tmpl
