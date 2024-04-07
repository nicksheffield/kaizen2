import {
	getBigName,
	getTableName,
	lc,
	mapAttributeTypeToGQL,
	mapAttributeTypeToGQLFilter,
	mapAttributeTypeToJs,
	sortAttrs,
} from './utils'
import { ProjectCtx } from './types'
import { camelize, isNotNone } from '@/lib/utils'
import { RelationType } from '@/lib/projectSchemas'
import pluralize from 'pluralize'

export type ModelCtx = ReturnType<typeof createModelCtx>

export const createModelCtx = (model: ProjectCtx['models'][number], ctx: ProjectCtx) => {
	const sourceRels = ctx.relations.filter((x) => x.sourceId === model.id && x.type === RelationType.manyToOne)
	const targetRels = ctx.relations.filter((x) => x.targetId === model.id && x.type === RelationType.oneToMany)
	const oneRels = ctx.relations.filter((x) => x.sourceId === model.id && x.type === RelationType.oneToOne)

	const allSourceRels = ctx.relations.filter((x) => x.sourceId === model.id)
	const allTargetRels = ctx.relations.filter((x) => x.targetId === model.id)

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
		attributes: model.attributes.sort(sortAttrs).map((x) => ({
			id: x.id,
			name: x.name,
			type: x.type,
			jsType: mapAttributeTypeToJs(x.type),
			// zodType: mapAttributeTypeToZod(x.type),
			gqlType: mapAttributeTypeToGQL(x.type),
			gqlFilter: mapAttributeTypeToGQLFilter(x.type),
			selectable: x.selectable,
			optional: x.nullable,
			optionalOp: x.nullable ? '?' : '!',
			default: x.name === 'id' ? idDefault : x.default,
			order: x.order,
		})),
		foreignKeys: [
			...sourceRels
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
					}
				})
				.filter(isNotNone),
			...targetRels
				.map((rel) => {
					const sourceModel = ctx.models.find((x) => x.id === rel.sourceId)
					if (!sourceModel) return null
					const name = lc(rel.sourceName || getBigName(sourceModel)) + 'Id'

					return {
						id: rel.id,
						name,
						optional: rel.optional,
						optionalOp: rel.optional ? '?' : '!',
						order: rel.targetOrder,
					}
				})
				.filter(isNotNone),
			...oneRels
				.map((rel) => {
					const targetModel = ctx.models.find((x) => x.id === rel.targetId)
					if (!targetModel) return null
					const name = lc(rel.targetName || getBigName(targetModel)) + 'Id'

					return {
						id: rel.id,
						name,
						optional: rel.optional,
						optionalOp: rel.optional ? '?' : '!',
						order: rel.targetOrder,
					}
				})
				.filter(isNotNone),
		],
		relatedModels: [
			...allSourceRels
				.map((rel) => {
					const sourceModel = ctx.models.find((x) => x.id === rel.sourceId)
					const targetModel = ctx.models.find((x) => x.id === rel.targetId)
					if (!sourceModel || !targetModel) return null

					const isArray = rel.type === RelationType.oneToMany

					// const oppositeField = pluralize(
					// 	rel.sourceName || camelize(sourceModel.name),
					// 	oppositeIsArray ? 2 : 1
					// )

					const targetName = rel.targetName || camelize(targetModel.key || targetModel.name)
					const sourceName = rel.sourceName || camelize(sourceModel.key || sourceModel.name)

					const oppositeIsArray = rel.type === RelationType.manyToOne
					const oppositeField = pluralize(sourceName, oppositeIsArray ? 2 : 1)

					const relType = rel.type

					return {
						id: targetModel.id,
						relType,
						single: pluralize(targetModel.key || camelize(targetModel.name), 1),
						many: pluralize(targetModel.key || camelize(targetModel.name), 2),
						entityName: getBigName(targetModel),
						fieldName: pluralize(targetName, isArray ? 2 : 1),
						oppositeField,
						optional: rel.optional,
						optionalOp: rel.optional ? '?' : '!',
						hasFk: sourceModel.id === model.id,
						isArray,
					}
				})
				.filter(isNotNone),
			...allTargetRels
				.map((rel) => {
					const sourceModel = ctx.models.find((x) => x.id === rel.sourceId)
					const targetModel = ctx.models.find((x) => x.id === rel.targetId)
					if (!sourceModel || !targetModel) return null

					const isArray = rel.type === RelationType.manyToOne

					const targetName = rel.targetName || camelize(targetModel.key || targetModel.name)
					const sourceName = rel.sourceName || camelize(sourceModel.key || sourceModel.name)

					const oppositeIsArray = rel.type === RelationType.oneToMany
					const oppositeField = pluralize(targetName, oppositeIsArray ? 2 : 1)

					const relType =
						rel.type === RelationType.manyToOne
							? RelationType.oneToMany
							: rel.type === RelationType.oneToMany
								? RelationType.manyToOne
								: rel.type

					return {
						id: sourceModel.id,
						relType,
						single: pluralize(sourceModel.key || camelize(sourceModel.name), 1),
						many: pluralize(sourceModel.key || camelize(sourceModel.name), 2),
						entityName: getBigName(sourceModel),
						fieldName: pluralize(sourceName, isArray ? 2 : 1),
						oppositeField,
						optional: rel.optional,
						optionalOp: rel.optional ? '?' : '!',
						hasFk: false,
						isArray,
					}
				})
				.filter(isNotNone),
		],
	}
}
