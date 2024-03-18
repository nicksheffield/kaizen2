import nodeCrypto from 'crypto'

export type SettingList = Record<string, () => string>

export const secrets: SettingList = {
	ACCESS_TOKEN_SECRET: () => nodeCrypto.randomBytes(64).toString('hex'),
	REFRESH_TOKEN_SECRET: () => nodeCrypto.randomBytes(64).toString('hex'),
	MARIADB_ROOT_PASSWORD: () => crypto.randomUUID().split('-')[0],
	MYSQL_USER: () => 'admin',
	MYSQL_PASSWORD: () => crypto.randomUUID().split('-')[0],
}
