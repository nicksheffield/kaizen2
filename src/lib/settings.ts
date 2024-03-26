import { generateId } from '@/lib/utils'
import nodeCrypto from 'crypto'

export type SettingList = Record<string, () => string>

export const secrets: SettingList = {
	ACCESS_TOKEN_SECRET: () => nodeCrypto.randomBytes(64).toString('hex'),
	REFRESH_TOKEN_SECRET: () => nodeCrypto.randomBytes(64).toString('hex'),
	MARIADB_ROOT_PASSWORD: () => generateId(6),
	MYSQL_USER: () => 'admin',
	MYSQL_PASSWORD: () => generateId(6),
	EMAIL_HOST: () => '',
	EMAIL_PORT: () => '',
	EMAIL_USER: () => '',
	EMAIL_PASS: () => '',
	EMAIL_FROM: () => '',
}
