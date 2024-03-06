import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { v4 } from 'uuid'

export const uuid = v4

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export type None = undefined | '' | false | null

export const isNotNone = <T>(x: T | None): x is T => {
	return x !== undefined && x !== '' && x !== false && x !== null
}

export const alphabetical = (a: string, b: string) => {
	return a < b ? -1 : a > b ? 1 : 0
}

export const camelize = (str: string) => {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase()
		})
		.replace(/\s+/g, '')
}

export const safeParse = <T>(str: string, fallback: T): T => {
	try {
		return JSON.parse(str)
	} catch {
		return fallback
	}
}

export const getEmptyProject = () => {
	const userModelId = uuid()

	return {
		project: {
			id: uuid(),
			name: 'New Project',
			repoUrl: '',
			domainName: '',
			maxBodySize: '2mb',
			connectionTimeout: 10000,
		},
		settings: [],
		models: [
			{
				id: userModelId,
				name: 'User',
				tableName: 'users',
				auditDates: true,
				posX: -552,
				posY: 48,
				enabled: true,
				attributes: [
					{
						id: uuid(),
						name: 'id',
						type: 'uuid',
						default: null,
						nullable: false,
						selectable: true,
						order: 0,
						enabled: true,
						modelId: userModelId,
					},
					{
						id: uuid(),
						name: 'name',
						type: 'text',
						default: null,
						nullable: false,
						selectable: true,
						order: 0,
						enabled: true,
						modelId: userModelId,
					},
					{
						id: uuid(),
						name: 'password',
						type: 'password',
						default: null,
						nullable: false,
						selectable: false,
						order: 0,
						enabled: true,
						modelId: userModelId,
					},
					{
						id: uuid(),
						name: 'email',
						type: 'text',
						default: null,
						nullable: false,
						selectable: true,
						order: 0,
						enabled: true,
						modelId: userModelId,
					},
				],
			},
		],
		relations: [],
	}
}
