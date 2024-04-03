const tmpl = () => `import { Request, Response } from 'express'
import { EntityTarget, ObjectLiteral } from 'typeorm'
import { z } from 'zod'
import { orm } from '~/orm'

export const getResource = <Entity extends ObjectLiteral>(
	model: EntityTarget<Entity>
) => {
	return {
		getById: async (id: string | number): Promise<Entity> => {
			// @ts-ignore
			return orm.manager.findOne(model, { where: { id } })
		},
		getMany: async (options?: { take: number; skip: number }) => {
			return orm.manager.findAndCount(model, options)
		},
		create: async (data: Entity) => {
			const item = orm.manager.create(model, data)
			return orm.manager.save(item)
		},
		update: async (id: string, data: Partial<Entity>) => {
			await orm.manager.update(model, { id }, data)
			return await orm.manager.findOneOrFail(model, {
				// @ts-ignore
				where: { id },
			})
		},
		softDelete: async (id: string) => {
			await orm.manager.update(
				model,
				{ id },
				// @ts-ignore
				{ deletedAt: new Date() }
			)

			return await orm.manager.findOneOrFail(model, {
				// @ts-ignore
				where: { id },
				withDeleted: true
			})
		},
		hardDelete: async (id: string) => {
			const entity = await orm.manager.findOneOrFail(model, {
				// @ts-ignore
				where: { id },
			})
			return orm.manager.remove(entity)
		},
	}
}

export const response = {
	notFound: (options?: { message?: string }): ResponseObject => ({
		data: options?.message,
		status: 404,
	}),

	badRequest: (options?: { message?: string }): ResponseObject => ({
		data: options?.message,
		status: 400,
	}),

	unauthorized: (options?: { message?: string }): ResponseObject => ({
		data: options?.message,
		status: 401,
	}),

	forbidden: (options?: { message?: string }): ResponseObject => ({
		data: options?.message,
		status: 403,
	}),

	error: (options?: { message?: string }): ResponseObject => ({
		data: options?.message,
		status: 500,
	}),

	text: (textData: string): ResponseObject => ({
		data: textData,
		status: 200,
		headers: {
			'content-type': 'text/plain',
		},
	}),

	buffer: (bufferData: Buffer): ResponseObject => ({
		data: bufferData,
		status: 200,
		headers: {
			'content-type': 'application/octet-stream',
		},
	}),

	json: (jsonData: {}): ResponseObject => ({
		data: jsonData,
		status: 200,
		headers: {
			'content-type': 'application/json',
		},
	}),
}

export type EndpointRequest<TParams, TQuery, TBody> = {
	path: string
	baseUrl: string
	hostname: string
	ip?: string
	method: string
	url: string
	route: string
	cookies: Record<string, string>
	user?: {
		id: string
	}
	params: TParams
	query: TQuery
	body: TBody
}

export type ResponseObject = {
	data: any
	status?: number
	headers?: Record<string, string>
}

export type EndpointHandlerType<TParams = any, TQuery = any, TBody = any> = (
	req: EndpointRequest<TParams, TQuery, TBody>
) => Promise<ResponseObject>

export const getSimpleRecord = (obj: object) => {
	if (!obj) return {}
	return Object.entries(obj).reduce<Record<string, string>>(
		(acc, [key, val]) => {
			if (typeof val === 'string') {
				acc[key] = val
				return acc
			}
			return acc
		},
		{}
	)
}

export const runCustomHandler = async (
	req: Request,
	res: Response,
	handler: EndpointHandlerType,
	schemas: {
		paramsSchema?: z.AnyZodObject
		querySchema?: z.AnyZodObject
		bodySchema?: z.AnyZodObject
	}
) => {
	let params = {}

	if (schemas.paramsSchema) {
		try {
			params = schemas.paramsSchema.parse(req.params)
		} catch (error) {
			return res.status(400).json({ message: 'Invalid Params' })
		}
	}

	let query = {}

	if (schemas.querySchema) {
		try {
			query = schemas.querySchema.parse(req.query)
		} catch (error) {
			return res.status(400).json({ message: 'Invalid Query Params' })
		}
	}

	let body = {}

	if (schemas.bodySchema) {
		try {
			body = schemas.bodySchema.parse(req.body)
		} catch (error) {
			return res.status(400).json({ message: 'Invalid Request Body' })
		}
	}

	const response = await handler({
		path: req.path,
		baseUrl: req.baseUrl,
		hostname: req.hostname,
		ip: req.ip,
		method: req.method,
		url: req.url,
		route: req.route,
		user: req.user,
		cookies: getSimpleRecord(req.cookies),
		params,
		query,
		body,
	})

	res.statusCode = response.status || 200
	res.set(response.headers || {})

	if (typeof response.data === 'object') {
		res.json(response.data)
	} else {
		res.send(response.data)
	}
}
`

export default tmpl
