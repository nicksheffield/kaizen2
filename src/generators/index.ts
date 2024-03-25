import * as express from './express'
import * as hono from './hono'

export const generators = {
	express: express.generate,
	hono: hono.generate,
} as const

export const generatorNames = Object.keys(generators)
