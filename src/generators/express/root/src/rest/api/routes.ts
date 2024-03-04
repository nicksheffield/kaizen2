import {
	getBigName,
	getSourceRelations,
	getTargetRelations,
	getSourceName,
	getTargetName,
	mapAttributeTypeToZod,
} from '@/generators/express/utils'
import { type TemplateModelCtx } from '@/generators/types'
import { RelationType } from '@/lib/schemas'

const tmpl = ({ model, relations }: TemplateModelCtx) => {
	const bigName = getBigName(model)
	// const smallName = getSmallName(model)
	const isUserModel = model.key === 'user'

	const sourceRelations = getSourceRelations(model, relations).filter(
		(rel) => rel.type === RelationType.manyToOne || rel.type === RelationType.oneToOne
	)
	const targetRelations = getTargetRelations(model, relations).filter((rel) => rel.type === RelationType.oneToMany)

	return `import express from 'express'
	import { z } from 'zod'
	import { authenticateToken${isUserModel ? ', hashPassword' : ''} } from '~/utils/auth'
	import { ${bigName} as Model } from '~/orm/entities/${bigName}'
	import { orm } from '~/orm'
	import { getNum } from '~/utils/fns'
	// import { SwaggerComponents, SwaggerPaths } from '~/utils/swaggerDoc'
	
	const validators = {
		create: z.object({
			id: z.string().optional(),
			${model.attributes
				.filter((x) => x.name !== 'id')
				.map((attr) => {
					return `${attr.name}: z.${mapAttributeTypeToZod(attr.type)}()${
						attr.nullable ? '.optional(),' : ','
					}`
				})
				.join('\n')}
			${sourceRelations
				.map((rel) => {
					return `${getTargetName(rel).toLowerCase()}Id: z.string()${rel.optional ? '.optional()' : ''},`
				})
				.join('\n')}
			${targetRelations
				.map((rel) => {
					return `${getSourceName(rel).toLowerCase()}Id: z.string()${rel.optional ? '.optional()' : ''},`
				})
				.join('\n')}
		}),
		update: z.object({
			id: z.string().uuid(),
			${model.attributes
				.filter((x) => x.name !== 'id')
				.map((attr) => {
					return `${attr.name}: z.${mapAttributeTypeToZod(attr.type)}().optional(),`
				})
				.join('\n')}
			${sourceRelations
				.map((rel) => {
					return `${getTargetName(rel).toLowerCase()}Id: z.string().optional(),`
				})
				.join('\n')}
			${targetRelations
				.map((rel) => {
					return `${getSourceName(rel).toLowerCase()}Id: z.string().optional(),`
				})
				.join('\n')}
		}),
	}
	
	const router = express.Router()
	
	router.get('/', authenticateToken, async (req, res) => {
		const page = getNum(String(req.query.page), 1)
		const limit = getNum(String(req.query.limit), 10)
	
		const [items, totalCount] = await orm.manager.findAndCount(Model, {
			skip: (page - 1) * limit,
			take: limit,
			relations: req.query.with ? String(req.query.with).split(',') : [],
			withDeleted: req.query.withDeleted === 'true',
		})
	
		res.json({
			items,
			page,
			limit,
			itemCount: items.length,
			totalCount,
			totalPages: Math.ceil(totalCount / limit),
		})
	})
	
	router.get('/:id', authenticateToken, async (req, res) => {
		const item = await orm.manager.findOne(Model, {
			where: { id: req.params.id },
			relations: req.query.with ? String(req.query.with).split(',') : [],
			withDeleted: req.query.withDeleted === 'true',
		})
	
		if (!item) {
			res.status(404).send('Not found')
			return
		}
	
		res.json(item)
	})
	
	router.post('/', authenticateToken, async (req, res) => {
		const item = new Model()
	
		const body = validators.create.parse(req.body)

		${model.attributes
			.map((attr) => {
				if (attr.type === 'password') {
					return `item.${attr.name} = await hashPassword(body.${attr.name})`
				}
				if (attr.name === 'id') {
					return `if (body.${attr.name}) item.${attr.name} = body.${attr.name}`
				}
				if (attr.type === 'datetime' || attr.type === 'date') {
					return `if (body.${attr.name}) item.${attr.name} = new Date(body.${attr.name}).toISOString()`
				}
				return `item.${attr.name} = body.${attr.name}`
			})
			.join('\n')}

		${sourceRelations
			.map((rel) => {
				const relName = getTargetName(rel).toLowerCase()
				if (rel.optional) {
					return `if (body.${relName}Id) item.${relName}Id = body.${relName}Id`
				}
				return `item.${relName}Id = body.${relName}Id`
			})
			.join('\n')}

		${targetRelations
			.map((rel) => {
				const relName = getSourceName(rel).toLowerCase()
				if (rel.optional) {
					return `if (body.${relName}Id) item.${relName}Id = body.${relName}Id`
				}
				return `item.${relName}Id = body.${relName}Id`
			})
			.join('\n')}
	
		const result = await orm.manager.save(item)
	
		const { ${model.attributes
			.filter((x) => !x.selectable)
			.map((x) => x.name)
			.concat([''])
			.join(', ')} ...rest } = result
	
		res.json(rest)
	})
	
	router.put('/:id', authenticateToken, async (req, res) => {
		const item = await orm.manager.findOne(Model, { where: { id: req.params.id, deletedAt: undefined } })
	
		if (!item) {
			res.status(404).send('Not found')
			return
		}
	
		const body = validators.update.parse(req.body)
	
		${model.attributes
			.map((attr) => {
				if (attr.type === 'password') {
					return `if (body.${attr.name}) item.${attr.name} = await hashPassword(body.${attr.name})`
				}
				if (attr.type === 'datetime' || attr.type === 'date') {
					return `if (body.${attr.name}) item.${attr.name} = new Date(body.${attr.name}).toISOString()`
				}
				return `if (body.${attr.name}) item.${attr.name} = body.${attr.name}`
			})
			.join('\n')}

		${sourceRelations
			.map((rel) => {
				const relName = getTargetName(rel).toLowerCase()
				return `if (body.${relName}Id) item.${relName}Id = body.${relName}Id`
			})
			.join('\n')}

		${targetRelations
			.map((rel) => {
				const relName = getSourceName(rel).toLowerCase()
				return `if (body.${relName}Id) item.${relName}Id = body.${relName}Id`
			})
			.join('\n')}
	
		const result = await orm.manager.save(item)
	
		const { ${model.attributes
			.filter((x) => !x.selectable)
			.map((x) => x.name)
			.concat([''])
			.join(', ')} ...rest } = result
	
		res.json(rest)
	})
	
	router.delete('/:id', authenticateToken, async (req, res) => {
		const id = z.string().parse(req.params.id)
	
		if (String(req.params.soft) === 'false') {
			await orm.manager.delete(Model, { id })
		} else {
			await orm.manager.softDelete(Model, { id })
		}
	
		res.sendStatus(204)
	})
	
	export default router
	`
}

export default tmpl
