import { mapAttrToDrizzleTypeFn, mapAttrToDrizzleTypeName } from '../../utils'
import { ModelCtx } from '../../contexts'

const tmpl = (ctx: { models: ModelCtx[] }) => {
	const attrTypeImports = ctx.models.flatMap((x) => x.attributes).map((x) => mapAttrToDrizzleTypeName(x.type))
	const requiredTypeImports = ['mysqlTable', 'timestamp', 'varchar', 'datetime']

	const drizzleTypeImports = [...attrTypeImports, ...requiredTypeImports].filter((x, i, a) => a.indexOf(x) === i)

	const models = ctx.models

	return `import { relations } from 'drizzle-orm'
import { ${drizzleTypeImports.join(', ')} } from 'drizzle-orm/mysql-core'

const auditDates = {
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').onUpdateNow(),
	deletedAt: timestamp('deleted_at'),
}

/**
 * Auth Tables
 */
export const sessions = mysqlTable('sessions', {
	id: varchar('id', { length: 15 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id),
	expiresAt: datetime('expires_at').notNull(),
})

export const emailVerificationCodes = mysqlTable('email_verification_codes', {
	id: varchar('id', { length: 15 }).primaryKey(),
	code: varchar('code', { length: 255 }).notNull(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => users.id),
	email: varchar('email', { length: 255 }).notNull(),
	expiresAt: datetime('expires_at').notNull(),
})

export const passwordResetToken = mysqlTable('password_reset_token', {
	tokenHash: varchar('token_hash', { length: 255 }).unique(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => users.id),
	expiresAt: datetime('expires_at').notNull(),
})

export const recoveryCodes = mysqlTable('recovery_codes', {
	codeHash: varchar('code_hash', { length: 255 }).unique().notNull(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => users.id),
})

/**
 * Auth Relations
 */
export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}))

export const emailVerificationCodeRelations = relations(
	emailVerificationCodes,
	({ one }) => ({
		user: one(users, {
			fields: [emailVerificationCodes.userId],
			references: [users.id],
		}),
	})
)

export const passwordResetTokenRelations = relations(
	passwordResetToken,
	({ one }) => ({
		user: one(users, {
			fields: [passwordResetToken.userId],
			references: [users.id],
		}),
	})
)

export const recoveryCodesRelations = relations(recoveryCodes, ({ one }) => ({
	user: one(users, {
		fields: [recoveryCodes.userId],
		references: [users.id],
	}),
}))

/**
 * App Tables
 */
${models
	.map((model) => {
		return `export const ${model.tableName} = mysqlTable('${model.tableName}', {
	id: varchar('id', { length: 15 }).primaryKey(),
	${model.attributes
		.map((attr) => {
			if (attr.name === 'id') return
			return `${attr.name}: ${mapAttrToDrizzleTypeFn(attr)}${attr.default !== null ? `.default(${attr.default})` : ''}${!attr.optional ? '.notNull()' : ''},`
		})
		.filter((x) => x !== undefined)
		.join('\n\t')}

	${model.foreignKeys
		.map((fk) => {
			if (fk.name === 'id') return
			return `${fk.name}: varchar('${fk.name}', { length: 15 })${fk.optional ? '' : '.notNull()'}.references(() => ${fk.otherTable}.id),`
		})
		.filter((x) => x !== undefined)
		.join('\n\t')}
		
	...auditDates,
})
`
	})
	.join('\n')}

/**
 * App Relations
 */
${models
	.map((model) => {
		const relationTypes = [
			model.relatedModels.find((x) => x.targetType === 'one') ? 'one' : null,
			model.relatedModels.find((x) => x.targetType === 'many') ? 'many' : null,
		].filter((x) => !!x)

		if (relationTypes.length === 0) return null

		return `export const ${model.tableName}Relations = relations(${model.tableName}, ({ ${relationTypes.join(', ')} }) => ({
	${
		model.tableName === 'users'
			? `sessions: many(sessions),
	emailVerificationCodes: many(emailVerificationCodes),
	passwordResetTokens: many(passwordResetToken),
	recoveryCodes: many(recoveryCodes),`
			: ''
	}
	${model.relatedModels
		.map((rel) => {
			// ${rel.side}
			if (rel.targetType === 'one') {
				return `${rel.fieldName}: one(${rel.tableName}, {
		fields: [${model.tableName}.${rel.thisKey}],
		references: [${rel.tableName}.${rel.oppositeKey}],
	})`
			}
			// ${rel.side}
			return `${rel.fieldName}: many(${rel.tableName})`
		})
		.join(',\n\t')}
}))
`
	})
	.filter((x) => !!x)
	.join('\n')}

`
}

export default tmpl
