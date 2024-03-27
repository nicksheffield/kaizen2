import { camelize, lc } from '../utils'
import { ModelCtx } from '../contexts'
import { ProjectCtx } from '@/generators/types'
import pluralize from 'pluralize'
import { z } from 'zod'
import { isNotNone } from '@/lib/utils'
import { RelationType } from '@/lib/schemas'

const AttributeSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	default: z.string().nullable().optional(),
	nullable: z.boolean(),
	selectable: z.boolean(),
	order: z.number(),
	enabled: z.boolean(),
	modelId: z.string(),
	foreignKey: z.boolean(),
})

const ModelSchema = z.object({
	id: z.string(),
	name: z.string(),
	tableName: z.string(),
	auditDates: z.boolean(),
	posX: z.number(),
	posY: z.number(),
	enabled: z.boolean(),
	attributes: z.array(AttributeSchema),
})

// const RelationSchema = z.object({
// 	id: z.string(),
// 	type: z.string(),
// 	sourceId: z.string(),
// 	sourceName: z.string(),
// 	sourceOrder: z.number(),
// 	targetId: z.string(),
// 	targetName: z.string(),
// 	targetOrder: z.number(),
// 	optional: z.boolean(),
// 	enabled: z.boolean(),
// })

const tmpl = ({ models, project }: { models: ModelCtx[]; project: ProjectCtx }) => {
	return JSON.stringify(
		{
			models: models.map((model) => {
				return ModelSchema.parse({
					id: model.id,
					name: model.name,
					tableName: model.tableName,
					auditDates: model.auditDates,
					posX: model.posX,
					posY: model.posY,
					enabled: true,
					attributes: [
						...model.attributes.map((attr) => ({
							id: attr.id,
							name: attr.name,
							type: attr.type,
							default: attr.default || null,
							nullable: attr.optional,
							selectable: attr.selectable,
							order: attr.order,
							enabled: true,
							modelId: model.id,
							foreignKey: false,
						})),
						...model.foreignKeys.map((fk) => ({
							id: fk.id,
							name: fk.name,
							type: 'id',
							default: null,
							nullable: fk.optional,
							selectable: true,
							order: fk.order,
							enabled: true,
							modelId: model.id,
							foreignKey: true,
						})),
					],
				})
			}),
			relations: project.relations
				.map((rel) => {
					const sourceModel = project.models.find((x) => x.id === rel.sourceId)
					const targetModel = project.models.find((x) => x.id === rel.targetId)

					if (!sourceModel || !targetModel) return null

					const sourceName = lc(
						pluralize(
							rel.sourceName || camelize(sourceModel?.key || sourceModel?.name || '') || 'A',
							rel.type === RelationType.manyToOne || rel.type === RelationType.manyToMany ? 2 : 1
						)
					)

					const targetName = lc(
						pluralize(
							rel.targetName || camelize(targetModel?.key || targetModel?.name || '') || 'B',
							rel.type === RelationType.oneToMany || rel.type === RelationType.manyToMany ? 2 : 1
						)
					)

					return {
						id: rel.id,
						type: rel.type,
						sourceId: rel.sourceId,
						sourceName,
						sourceOrder: rel.sourceOrder,
						targetId: rel.targetId,
						targetName,
						targetOrder: rel.targetOrder,
						optional: rel.optional,
						enabled: true,
					}
				})
				.filter(isNotNone),
		},
		null,
		4
	)
}

export default tmpl
