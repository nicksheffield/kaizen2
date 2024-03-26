import { secrets } from '@/lib/settings'
import { type ClassValue, clsx } from 'clsx'
import { singular } from 'pluralize'
import { twMerge } from 'tailwind-merge'
import { alphabet, generateRandomString } from 'oslo/crypto'

import { v4 } from 'uuid'
import { Attribute, Project } from '@/lib/schemas'

export const generateId = (length: number = 5) => generateRandomString(length, alphabet('0-9', 'a-z'))

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

export const uc = (str: string) => {
	const firstLetter = str[0]
	if (!firstLetter) throw new Error('No first letter in string')
	return `${firstLetter.toUpperCase()}${str.slice(1)}`
}

export const lc = (str: string) => {
	const firstLetter = str[0]
	if (!firstLetter) throw new Error('No first letter in string')
	return `${firstLetter.toLowerCase()}${str.slice(1)}`
}

export const getSmallName = (model: { key: string; name: string }) => singular(model.key || camelize(model.name))
export const getBigName = (model: { key: string; name: string }) => uc(getSmallName(model))

export const safeParse = <T>(str: string, fallback: T): T => {
	try {
		return JSON.parse(str)
	} catch {
		return fallback
	}
}

export const userModelFields: Attribute[] = [
	{
		id: 'n0qx6',
		name: 'email',
		type: 'text',
		default: null,
		nullable: false,
		selectable: true,
		insertable: true,
		order: 2,
		enabled: true,
		modelId: '',
		foreignKey: false,
	},
	{
		id: 'yni7z',
		name: 'password',
		type: 'password',
		default: null,
		nullable: false,
		selectable: false,
		insertable: true,
		order: 3,
		enabled: true,
		modelId: '',
		foreignKey: false,
	},
	{
		id: 'c77ge',
		name: 'twoFactorSecret',
		type: 'text',
		default: '',
		nullable: true,
		selectable: false,
		insertable: false,
		order: 4,
		enabled: true,
		modelId: '',
		foreignKey: false,
	},
	{
		id: '5oa41',
		name: 'twoFactorEnabled',
		type: 'boolean',
		default: 'false',
		nullable: false,
		selectable: true,
		insertable: false,
		order: 5,
		enabled: true,
		modelId: '',
		foreignKey: false,
	},
	{
		id: '3c9u5',
		name: 'emailVerified',
		type: 'boolean',
		default: 'false',
		nullable: false,
		selectable: true,
		insertable: false,
		order: 6,
		enabled: true,
		modelId: '',
		foreignKey: false,
	},
	{
		id: 'viuvb',
		name: 'roles',
		type: 'text',
		default: 'default',
		nullable: false,
		selectable: true,
		insertable: true,
		order: 7,
		enabled: true,
		modelId: '',
		foreignKey: false,
	},
]

export const getUserModelFields = (modelId: string): Attribute[] => {
	return userModelFields.map((x) => ({ ...x, modelId }))
}

export const getIsUserAttr = (id: string) => {
	return userModelFields.some((x) => x.id === id)
}

export const getEmptyProject = (): Project => {
	return {
		project: {
			id: generateId(5),
			name: 'New Project',
			repoUrl: '',
			generator: 'hono',
			domainName: '',
			maxBodySize: '2mb',
			connectionTimeout: 10000,
			userModelId: '',
		},
		auth: {
			cookies: true,
			bearer: true,
			expiresIn: '60',
		},
		formatSettings: {
			prettierTabs: true,
			prettierTabWidth: 4,
			prettierSemicolons: false,
			prettierPrintWidth: 120,
		},
		env: {
			ACCESS_TOKEN_SECRET: secrets.ACCESS_TOKEN_SECRET(),
			REFRESH_TOKEN_SECRET: secrets.REFRESH_TOKEN_SECRET(),
			MARIADB_ROOT_PASSWORD: secrets.MARIADB_ROOT_PASSWORD(),
			MYSQL_USER: secrets.MYSQL_USER(),
			MYSQL_PASSWORD: secrets.MYSQL_PASSWORD(),
			EMAIL_HOST: secrets.EMAIL_HOST(),
			EMAIL_PORT: secrets.EMAIL_PORT(),
			EMAIL_USER: secrets.EMAIL_USER(),
			EMAIL_PASS: secrets.EMAIL_PASS(),
			EMAIL_FROM: secrets.EMAIL_FROM(),
		},
		models: [],
		relations: [],
	}
}
