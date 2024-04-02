import * as v1_0 from './v1.0'
import * as v2_0 from './v2.0'

export * from './v2.0'

export const projectVersion = 2

export const projectSchemas = [v1_0, v2_0] as const

export const parseProject = (content: string) => {
	let project = JSON.parse(content)

	while (project.v < projectVersion) {
		project = projectSchemas[project.v].upgrade(project)
	}

	const parsedProject = projectSchemas[1].ProjectSchema.parse(project)

	// the index on projectSchemas needs to be projectVersion - 1
	return parsedProject
}
