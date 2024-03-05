import { z } from 'zod'

export type AttributeType = keyof typeof AttributeType
export const AttributeType = {
	uuid: 'uuid',
	a_i: 'a_i',
	text: 'text',
	base64: 'base64',
	password: 'password',
	int: 'int',
	float: 'float',
	boolean: 'boolean',
	datetime: 'datetime',
	date: 'date',
	time: 'time',
} as const
export const AttributeTypeSchema = z.union([
	z.literal('uuid'),
	z.literal('a_i'),
	z.literal('text'),
	z.literal('base64'),
	z.literal('password'),
	z.literal('int'),
	z.literal('float'),
	z.literal('boolean'),
	z.literal('datetime'),
	z.literal('date'),
	z.literal('time'),
])

export type Attribute = z.infer<typeof AttributeSchema>
export const AttributeSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: AttributeTypeSchema,
	default: z.string().nullable(),
	nullable: z.boolean(),
	selectable: z.boolean(),
	order: z.number(),
	enabled: z.boolean().optional(),
	modelId: z.string(),
})

export type Model = z.infer<typeof ModelSchema>
export const ModelSchema = z.object({
	id: z.string(),
	name: z.string(),
	key: z.string().optional(),
	tableName: z.string(),
	auditDates: z.boolean(),
	posX: z.number(),
	posY: z.number(),
	enabled: z.boolean().optional(),
	attributes: z.array(AttributeSchema),
})

export type RelationType = keyof typeof RelationType
export const RelationType = {
	oneToOne: 'oneToOne',
	oneToMany: 'oneToMany',
	manyToOne: 'manyToOne',
	manyToMany: 'manyToMany',
} as const
export const RelationTypeUnion = z.union([
	z.literal('oneToOne'),
	z.literal('oneToMany'),
	z.literal('manyToOne'),
	z.literal('manyToMany'),
])

export type Relation = z.infer<typeof RelationSchema>
export const RelationSchema = z.object({
	id: z.string(),
	type: RelationTypeUnion,
	sourceId: z.string(),
	sourceName: z.string(),
	sourceOrder: z.number(),
	targetId: z.string(),
	targetName: z.string(),
	targetOrder: z.number(),
	optional: z.boolean(),
	enabled: z.boolean().optional(),
})

export type Method = keyof typeof Method
export const Method = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
} as const
export const MethodUnion = z.union([z.literal('GET'), z.literal('POST'), z.literal('PUT'), z.literal('DELETE')])

export type Endpoint = z.infer<typeof EndpointSchema>
export const EndpointSchema = z.object({
	id: z.string(),
	name: z.string(),
	path: z.string(),
	queryParams: z.string(),
	body: z.string(),
	method: MethodUnion,
})

export type EndpointGroup = z.infer<typeof EndpointGroupSchema>
export const EndpointGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
})

export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>
export const ProjectSettingsSchema = z.object({
	id: z.string(),
	name: z.string(),
	repoUrl: z.string().nullable(),
	domainName: z.string().optional(),
	maxBodySize: z.string().optional(),
	connectionTimeout: z.number().optional(),
})

export type SettingType = keyof typeof SettingType
export const SettingType = {
	setting: 'setting',
	generator: 'generator',
	secret: 'secret',
} as const
export const SettingTypeUnion = z.union([z.literal('setting'), z.literal('generator'), z.literal('secret')])

export type Project = z.infer<typeof ProjectSchema>
export const ProjectSchema = z.object({
	project: ProjectSettingsSchema,
	settings: z.array(
		z.object({
			id: z.string(),
			key: z.string(),
			value: z.string(),
			type: SettingTypeUnion,
		})
	),
	models: z.array(ModelSchema),
	relations: z.array(RelationSchema),
})
