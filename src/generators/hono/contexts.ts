import {
	getBigName,
	getTableName,
	lc,
	mapAttributeTypeToGQL,
	mapAttrToGQLFilter,
	mapAttributeTypeToJs,
	sortAttrs,
	vetDefault,
} from '@/generators/hono/utils'
import { ProjectCtx } from '@/generators/types'
import { camelize, isNotNone } from '@/lib/utils'
import { RelationType } from '@/lib/schemas'
import pluralize from 'pluralize'

export type ModelCtx = ReturnType<typeof createModelCtx>

export const createModelCtx = (model: ProjectCtx['models'][number], ctx: ProjectCtx) => {
	const sourceRels = ctx.relations.filter((x) => x.sourceId === model.id && x.type === RelationType.manyToOne)
	const targetRels = ctx.relations.filter((x) => x.targetId === model.id && x.type === RelationType.oneToMany)
	const oneRels = ctx.relations.filter((x) => x.sourceId === model.id && x.type === RelationType.oneToOne)

	const allSourceRels = ctx.relations.filter((x) => x.sourceId === model.id)
	const allTargetRels = ctx.relations.filter((x) => x.targetId === model.id)

	// const idDefault = ctx.database === 'postgres' ? 'uuid_generate_v4()' : null
	const idDefault = null

	return {
		// orig: model,
		id: model.id,
		name: model.name,
		tableName: getTableName(model),
		entityName: getBigName(model),
		gqlTypeName: getBigName(model),
		endpointName: lc(pluralize(model.key || camelize(model.name), 2)),
		single: pluralize(model.key || camelize(model.name), 1),
		many: pluralize(model.key || camelize(model.name), 2),
		auditDates: model.auditDates,
		posX: model.posX,
		posY: model.posY,
		attributes: model.attributes.sort(sortAttrs).map((x) => {
			const defaultValue = vetDefault(x.default)
			return {
				id: x.id,
				name: x.name,
				type: x.type,
				jsType: mapAttributeTypeToJs(x.type),
				// zodType: mapAttributeTypeToZod(x.type),
				gqlType: mapAttributeTypeToGQL(x.type),
				gqlFilter: mapAttrToGQLFilter(x.type),
				selectable: x.selectable,
				insertable: x.insertable,
				optional: x.nullable,
				optionalOp: x.nullable ? '?' : '!',
				default: x.name === 'id' ? idDefault : defaultValue,
				order: x.order,
			}
		}),
		foreignKeys: [
			...sourceRels
				.sort((a, b) => a.sourceOrder - b.sourceOrder)
				.map((rel) => {
					const targetModel = ctx.models.find((x) => x.id === rel.targetId)
					if (!targetModel) return null
					const name = lc(rel.targetName || getBigName(targetModel)) + 'Id'

					return {
						id: rel.id,
						name,
						optional: rel.optional,
						optionalOp: rel.optional ? '?' : '!',
						order: rel.sourceOrder,
						otherTable: getTableName(targetModel),
					}
				})
				.filter(isNotNone),
			...targetRels
				.sort((a, b) => a.targetOrder - b.targetOrder)
				.map((rel) => {
					const sourceModel = ctx.models.find((x) => x.id === rel.sourceId)
					if (!sourceModel) return null
					const name = lc(rel.sourceName || getBigName(sourceModel)) + 'Id'

					return {
						id: rel.id,
						name,
						optional: rel.optional,
						order: rel.targetOrder,
						otherTable: getTableName(sourceModel),
					}
				})
				.filter(isNotNone),
			...oneRels
				.sort((a, b) => a.sourceOrder - b.sourceOrder)
				.map((rel) => {
					const targetModel = ctx.models.find((x) => x.id === rel.targetId)
					if (!targetModel) return null
					const name = lc(rel.targetName || getBigName(targetModel)) + 'Id'

					return {
						id: rel.id,
						name,
						optional: rel.optional,
						order: rel.targetOrder,
						otherTable: getTableName(targetModel),
					}
				})
				.filter(isNotNone),
		],
		relatedModels: [
			...allSourceRels
				.sort((a, b) => a.sourceOrder - b.sourceOrder)
				.map((rel) => {
					const otherModel = ctx.models.find((x) => x.id === rel.targetId)
					if (!otherModel) return null

					const tableName = getTableName(otherModel)

					const thisName = rel.sourceName || camelize(model.key || model.name)
					const otherName = rel.targetName || camelize(otherModel.key || otherModel.name)

					const isArray = rel.type === RelationType.oneToMany || rel.type === RelationType.manyToMany
					const fieldName = pluralize(otherName, isArray ? 2 : 1)

					const thisKey = (() => {
						if (rel.type === RelationType.oneToOne) return `${otherName}Id`
						if (rel.type === RelationType.manyToOne) return `${otherName}Id`
						if (rel.type === RelationType.oneToMany) return `id`
						if (rel.type === RelationType.manyToMany) return `${otherName}Id`
					})()

					const oppositeKey = (() => {
						if (rel.type === RelationType.oneToOne) return `id`
						if (rel.type === RelationType.manyToOne) return `id`
						if (rel.type === RelationType.oneToMany) return `${thisName}Id`
						if (rel.type === RelationType.manyToMany) return `${thisName}Id`
					})()

					const targetType = (() => {
						if (rel.type === RelationType.oneToOne) return 'one'
						if (rel.type === RelationType.manyToOne) return 'one'
						return 'many'
					})()

					return {
						otherModel,
						relation: rel,
						targetType,
						tableName,
						fieldName,
						thisKey,
						oppositeKey,
						optional: rel.optional,
						side: 'source',
						isArray,
					}
				})
				.filter(isNotNone),
			...allTargetRels
				.sort((a, b) => a.targetOrder - b.targetOrder)
				.map((rel) => {
					const otherModel = ctx.models.find((x) => x.id === rel.sourceId)
					if (!otherModel) return null

					const tableName = getTableName(otherModel)

					const thisName = rel.targetName || camelize(model.key || model.name)
					const otherName = rel.sourceName || camelize(otherModel.key || otherModel.name)

					const isArray = rel.type === RelationType.manyToOne || rel.type === RelationType.manyToMany
					const fieldName = pluralize(otherName, isArray ? 2 : 1)

					const thisKey = (() => {
						if (rel.type === RelationType.oneToOne) return `id`
						if (rel.type === RelationType.manyToOne) return `id`
						if (rel.type === RelationType.oneToMany) return `${otherName}Id`
						/* manyToMany */ return `${otherName}Id`
					})()

					const oppositeKey = (() => {
						if (rel.type === RelationType.oneToOne) return `${thisName}Id`
						if (rel.type === RelationType.manyToOne) return `${thisName}Id`
						if (rel.type === RelationType.oneToMany) return `id`
						/* manyToMany */ return `${thisName}Id`
					})()

					const targetType = (() => {
						if (rel.type === RelationType.oneToOne) return 'one'
						if (rel.type === RelationType.oneToMany) return 'one'
						return 'many'
					})()

					return {
						otherModel,
						relation: rel,
						targetType,
						tableName,
						fieldName,
						thisKey,
						oppositeKey,
						optional: rel.optional,
						side: 'target',
						isArray,
					}
				})
				.filter(isNotNone),
		],
	}
}
