import { type Attribute, type Model, type Relation, Project, Endpoint, EndpointGroup } from '@/lib/projectSchemas'

// export type ProjectCtx = Awaited<ReturnType<typeof getProjectCtx>>
export type ProjectCtx = Project

export type RelationWithModels = Relation & {
	source: Model
	target: Model
}

export type ModelWithAttributes = Model & {
	attributes: Attribute[]
}

export type EndpointGroupWithEndpoints = EndpointGroup & {
	endpoints: Endpoint[]
}

export type TemplateCtx = {
	project: Project
	models: ModelWithAttributes[]
	relations: RelationWithModels[]
}

export type TemplateModelCtx = {
	model: ModelWithAttributes
	relations: RelationWithModels[]
}

export type TemplateRelationCtx = {
	relation: RelationWithModels
}

export type TemplateEndpointGroupsCtx = {
	group: EndpointGroupWithEndpoints
	models: ModelWithAttributes[]
	relations: RelationWithModels[]
}

export type TemplateEndpointCtx = {
	endpoint: Endpoint
	models: ModelWithAttributes[]
	relations: RelationWithModels[]
}

export type GeneratorFn = (
	project: ProjectCtx,
	extras: {
		seeder: string | undefined
	}
	// ctx: TemplateCtx & {
	// 	endpointGroups: (EndpointGroup & { endpoints: Endpoint[] })[]
	// 	generatorSettings: GeneratorSetting[]
	// }
) => Promise<Record<string, string>>
