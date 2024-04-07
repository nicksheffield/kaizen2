import * as express from './express'
import * as Express from './express/types'

import * as hono from './hono'
import * as Hono from './hono/types'

export const generators = {
	express: express.generate,
	hono: hono.generate,
} as const

export const generatorNames = Object.keys(generators)

export type ExpressGeneratorFn = Express.ExpressGeneratorFn
export type HonoGeneratorFn = Hono.HonoGeneratorFn

export type GeneratorFn = ExpressGeneratorFn | HonoGeneratorFn
