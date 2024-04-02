import { ProjectCtx, RelationWithModels } from '@/generators/types'
import { RelationType, type AttributeType, Model, Attribute, Relation } from '@/lib/projectSchemas'
import pluralize, { plural, singular } from 'pluralize'
import prettier from 'prettier'
// import typescriptParser from 'prettier/parser-typescript'
import typescriptPlugin from 'prettier/plugins/typescript'
import estreePlugin from 'prettier/plugins/estree'
import { z } from 'zod'

export const format = async (content: string, settings: Partial<prettier.Options> = {}) => {
	try {
		return prettier.format(content, {
			tabWidth: 4,
			useTabs: true,
			singleQuote: true,
			semi: false,
			printWidth: 120,
			trailingComma: 'es5',
			arrowParens: 'always',
			parser: 'typescript',
			...settings,
			plugins: [estreePlugin, typescriptPlugin],
		})
	} catch (e) {
		console.log(e)
		return content
	}
}

export const getProjectFormatter = (project: ProjectCtx) => {
	const formatSettings = {
		useTabs: project.formatSettings?.prettierTabs,
		tabWidth: project.formatSettings?.prettierTabWidth,
		semi: project.formatSettings?.prettierSemicolons,
		printWidth: project.formatSettings?.prettierPrintWidth,
	}

	return async (content: string) => {
		try {
			return format(content, formatSettings)
		} catch (e) {
			console.log(e)
			return content
		}
	}
}

export const sortAttrs = (a: Attribute, b: Attribute) => {
	if (a.name === 'id') return -1
	return a.order - b.order
}

export const uc = (str: string) => {
	const firstLetter = str[0]
	if (!firstLetter) throw new Error('No first letter in string')
	return `${firstLetter.toUpperCase()}${str.slice(1)}`
}

export const lc = (str: string) => {
	const firstLetter = str[0]
	if (!firstLetter) throw new Error('No first letter in string')
	return `${firstLetter.toLowerCase()}${str.slice(1)}`
}

export const camelize = (str: string) => {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase()
		})
		.replace(/\s+/g, '')
}

export const getSmallName = (model: Model) => singular(model.key || camelize(model.name))

export const getBigName = (model: Model) => uc(getSmallName(model))

export const getTableName = (model: Model) => model.tableName || plural(model.key || camelize(model.name))

export const getSourceRelations = (model: Model, relations: RelationWithModels[]) => {
	return relations.filter((rel) => rel.sourceId === model.id)
}

export const getTargetRelations = (model: Model, relations: RelationWithModels[]) => {
	return relations.filter((rel) => rel.targetId === model.id)
}

export const getSourceName = (rel: RelationWithModels) => {
	return pluralize(
		rel.sourceName || rel.source?.key || camelize(rel.source?.name || ''),
		rel.type === RelationType.manyToOne ? 2 : 1
	)
}

export const getTargetName = (rel: RelationWithModels) => {
	return pluralize(
		rel.targetName || rel.target?.key || camelize(rel.source?.name || ''),
		rel.type === RelationType.oneToMany ? 2 : 1
	)
}

export const getModel = (models: Model[], id: string) => {
	return models.find((x) => x.id === id)
}

export const getJoiningTableBigName = (rel: RelationWithModels) => {
	return `_${rel.sourceName || rel.source.name}_${rel.targetName || rel.target.name}`
}

export const getJoiningTableSmallName = (rel: RelationWithModels) => {
	return getJoiningTableBigName(rel).toLowerCase()
}

type NormalizedRelation = {
	id: string
	type: RelationType //'hasMany' | 'hasOne'
	realType: RelationType
	fromModel: Model
	fromName: string
	toModel: Model
	toName: string
	optional: boolean
	debug: 'source' | 'target'
}

export const normalizeRelations = (
	sourceRelations: RelationWithModels[],
	targetRelations: RelationWithModels[]
): NormalizedRelation[] => {
	const normies: NormalizedRelation[] = []

	for (const rel of sourceRelations) {
		const fromModel = rel.source
		const toModel = rel.target

		if (!fromModel || !toModel || rel.type === RelationType.manyToMany) continue

		const type = rel.type

		const normie: NormalizedRelation = {
			id: rel.id,
			type,
			realType: rel.type,
			fromModel,
			toModel,
			fromName: pluralize(rel.sourceName || getSmallName(fromModel), type === RelationType.manyToOne ? 2 : 1),
			toName: pluralize(rel.targetName || getSmallName(toModel), type === RelationType.oneToMany ? 2 : 1),
			optional: rel.optional,
			debug: 'source',
		}

		normies.push(normie)
	}

	for (const rel of targetRelations) {
		const fromModel = rel.target
		const toModel = rel.source

		if (!fromModel || !toModel || rel.type === RelationType.manyToMany) continue

		const type =
			rel.type === RelationType.oneToMany
				? RelationType.manyToOne
				: rel.type === RelationType.manyToOne
					? RelationType.oneToMany
					: rel.type

		const normie: NormalizedRelation = {
			id: rel.id,
			type,
			realType: rel.type,
			fromModel,
			toModel,
			fromName: pluralize(rel.targetName || getSmallName(fromModel), type === RelationType.manyToOne ? 2 : 1),
			toName: pluralize(rel.sourceName || getSmallName(toModel), type === RelationType.oneToMany ? 2 : 1),
			optional: rel.optional,
			debug: 'target',
		}

		normies.push(normie)
	}

	return normies
}

export const mapAttributeTypeToZod = (type: AttributeType) => {
	switch (type) {
		case 'text':
		case 'base64':
		case 'password':
		case 'id':
			return 'string'
		case 'int':
		case 'float':
		case 'a_i':
			return 'number'
		case 'boolean':
			return 'boolean'
		case 'date':
		case 'time':
		case 'datetime':
			return 'date'
		default:
			return 'any'
	}
}

export const mapAttributeTypeToPostgres = (type: AttributeType) => {
	switch (type) {
		case 'text':
		case 'password':
			return 'text'
		case 'base64':
			return 'longtext'
		case 'id':
			return 'id'
		case 'int':
		case 'a_i':
			return 'int8'
		case 'float':
			return 'float'
		case 'boolean':
			return 'boolean'
		case 'date':
			return 'date'
		case 'time':
			return 'timetz'
		case 'datetime':
			return 'timestamptz'
		default:
			return 'text'
	}
}

export const mapAttributeTypeToJs = (type: AttributeType) => {
	switch (type) {
		case 'text':
		case 'base64':
		case 'password':
		case 'date':
		case 'time':
		case 'datetime':
			return 'string'
		case 'int':
		case 'float':
		case 'a_i':
			return 'number'
		case 'boolean':
			return 'boolean'
		default:
			return 'string'
	}
}

export const mapAttributeTypeToGQL = (type: AttributeType) => {
	switch (type) {
		case 'text':
		case 'base64':
		case 'password':
		case 'date':
		case 'time':
		case 'datetime':
			return 'string'
		case 'int':
		case 'float':
		case 'a_i':
			return 'number'
		case 'boolean':
			return 'boolean'
		default:
			return 'string'
	}
}

export const mapAttributeTypeToGQLFilter = (type: AttributeType) => {
	switch (type) {
		case 'text':
		case 'base64':
		case 'password':
		case 'id':
			return 'StringFilterInput'
		case 'int':
		case 'float':
		case 'a_i':
			return 'NumberFilterInput'
		case 'boolean':
			return 'BooleanFilterInput'
		case 'date':
		case 'time':
		case 'datetime':
			return 'NumberFilterInput'
		default:
			return 'StringFilterInput'
	}
}

export const mapRelationTypeToTypeORM = (type: RelationType) => {
	switch (type) {
		case RelationType.oneToMany:
			return 'OneToMany'
		case RelationType.manyToOne:
			return 'ManyToOne'
		case RelationType.oneToOne:
			return 'OneToOne'
		case RelationType.manyToMany:
			return 'ManyToMany'
	}
}

export const endpointQueryParam = z.object({ name: z.string() })

export const endpointQueryParams = z.array(endpointQueryParam)

export const ModelBodyDef = z.object({
	type: z.literal('Model'),
	value: z.string().optional(),
	required: z.boolean().optional(),
})

type ArrayBodyDefType = {
	type: 'Array'
	value?: z.infer<typeof BodyDef>
	required?: boolean
}

export const ArrayBodyDef: z.ZodType<ArrayBodyDefType> = z.object({
	type: z.literal('Array'),
	value: z.lazy(() => BodyDef).optional(),
	required: z.boolean().optional(),
})

type ObjectBodyDefType = {
	type: 'Object'
	value?: Record<string, z.infer<typeof BodyDef>>
	required?: boolean
}

export const ObjectBodyDef: z.ZodType<ObjectBodyDefType> = z.object({
	type: z.literal('Object'),
	value: z.lazy(() => z.record(BodyDef)).optional(),
	required: z.boolean().optional(),
})

export const PrimitiveBodyDef = z.object({
	type: z.literal('Primitive'),
	value: z.enum(['string', 'number', 'boolean']).optional(),
	required: z.boolean().optional(),
})

export const BodyDef = z.union([ModelBodyDef, ArrayBodyDef, ObjectBodyDef, PrimitiveBodyDef])

export const bodyDefToTypeString = (
	def: z.infer<typeof BodyDef>,
	ctx: { models: (Model & { attributes: Attribute[] })[] }
): string => {
	if (def.type === 'Primitive') {
		return def.value || 'undefined'
	}

	if (def.type === 'Model') {
		const model = ctx.models.find((x) => x.key === def.value)
		if (!model) return ''
		return `{
			${model.attributes
				.sort((a, b) => a.order - b.order)
				.map(
					(attr) =>
						`${attr.name}${attr.nullable || attr.name === 'id' ? '?:' : ':'} ${mapAttributeTypeToJs(
							attr.type
						)}`
				)
				.join('\n\t\t')}
			}`
	}

	if (def.type === 'Array') {
		if (!def.value) return ''
		return `Array<${bodyDefToTypeString(def.value, ctx)}>`
	}

	if (def.type === 'Object') {
		return `{
			${Object.entries((def.value as Record<string, any>) || {})
				.map(([key, value]) => `${key}: ${bodyDefToTypeString(value, ctx)}`)
				.join('\n\t\t')}
		}`
	}

	return ``
}

export const bodyDefToZodSchema = (
	def: z.infer<typeof BodyDef>,
	ctx: { models: (Model & { attributes: Attribute[] })[]; relations: Relation[] }
): string => {
	if (def.type === 'Primitive') {
		switch (def.value) {
			case 'string':
				return 'z.string()'
			case 'number':
				return 'z.number()'
			case 'boolean':
				return 'z.boolean()'
			default:
				return 'z.any()'
		}
	}

	if (def.type === 'Model') {
		const model = ctx.models.find((x) => x.id === def.value)

		if (!model) return ''

		const sourceRelations = ctx.relations
			.filter((x) => x.sourceId === model.id)
			.filter((rel) => rel.type === RelationType.manyToOne || rel.type === RelationType.oneToOne)
			.map((rel) => {
				const target = ctx.models.find((x) => x.id === rel.targetId)
				const smallName = target ? getSmallName(target) : ''

				const relname = pluralize(rel.targetName || smallName, rel.type === RelationType.oneToMany ? 2 : 1)

				return { name: `${relname}Id`, optional: rel.optional }
			})
		const targetRelations = ctx.relations
			.filter((x) => x.targetId === model.id)
			.filter((rel) => rel.type === RelationType.oneToMany)
			.map((rel) => {
				const source = ctx.models.find((x) => x.id === rel.sourceId)
				const smallName = source ? getSmallName(source) : ''

				const relname = pluralize(rel.sourceName || smallName, rel.type === RelationType.manyToOne ? 2 : 1)

				return { name: `${relname}Id`, optional: rel.optional }
			})

		return `z.object({
			${model.attributes
				.sort((a, b) => a.order - b.order)
				.map(
					(attr) =>
						`${attr.name}: z.${mapAttributeTypeToZod(attr.type)}()${
							attr.nullable || attr.name === 'id' ? '.optional()' : ''
						},`
				)
				.join('\n\t\t')}

				${sourceRelations.map((rel) => `${rel.name}: z.string()${rel.optional ? '.optional()' : ''},`).join('\n\t\t')}
				${targetRelations.map((rel) => `${rel.name}: z.string()${rel.optional ? '.optional()' : ''},`).join('\n\t\t')}
			})`
	}

	if (def.type === 'Array') {
		if (!def.value) return ''
		return `z.array(${bodyDefToZodSchema(def.value, ctx)})`
	}

	if (def.type === 'Object') {
		const entries = Object.entries((def.value as Record<string, any>) || {})

		if (!entries.length) return ''

		return `z.object({
			${entries.map(([key, value]) => `${key}: ${bodyDefToZodSchema(value, ctx)},`).join('\n\t\t')}
		})`
	}

	return ``
}
