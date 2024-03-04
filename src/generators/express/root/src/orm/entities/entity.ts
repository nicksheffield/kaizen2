import { AttributeType, RelationType } from '@/lib/schemas'
import { ModelCtx } from '../../../../contexts'
import { uc } from '../../../../utils'

const tmpl = ({ model }: { model: ModelCtx }) => {
	return `
		import { Field, ID, ObjectType, Float } from 'type-graphql'
		import { TypeormLoader } from 'type-graphql-dataloader'
		import {
			Entity,
			PrimaryGeneratedColumn,
			Column,
			CreateDateColumn,
			UpdateDateColumn,
			DeleteDateColumn,
			ManyToOne,
			OneToMany,
			ManyToMany,
			OneToOne,
			JoinTable,
			JoinColumn,
		} from 'typeorm'
		${model.relatedModels
			.map((model) => `import { ${model.entityName} } from '~/orm/entities/${model.entityName}'`)
			.join('\n')}

		@ObjectType()
		@Entity("${model.tableName}")
		export class ${model.entityName} {

		${model.attributes
			.map((attr) => {
				const type = attr.type === AttributeType.float ? `(type) => Float` : ''
				const column: { select?: boolean; type?: string } = {}

				if (!attr.selectable) {
					column.select = false
				}

				if (attr.type === AttributeType.float) {
					column.type = 'float'
				}

				return `
						${
							attr.type === 'uuid'
								? `@Field(() => ID ${attr.optional ? ', { nullable: true }' : ''})`
								: attr.selectable
									? `@Field(${type}${type && attr.optional ? ', ' : ''}${
											attr.optional ? '{ nullable: true }' : ''
										})`
									: ''
						}
						${attr.type === 'uuid' ? `@PrimaryGeneratedColumn('uuid')` : `@Column(${JSON.stringify(column)})`}
						${attr.name}${!attr.optional ? '!' : '?'}: ${attr.jsType}
					`
			})
			.join('\n')}

			${model.foreignKeys
				.map(
					(fk) => `
				@Field(${fk.optional ? '{ nullable: true }' : ''})
				@Column()
				${fk.name}${fk.optionalOp}: string
			`
				)
				.join('\n')}

			${model.relatedModels
				.map(
					(relModel) => `
				${
					relModel.relType === RelationType.oneToOne
						? `
					@Field((type) => ${relModel.entityName}${relModel.optional ? ', { nullable: true }' : ''})
					@OneToOne(() => ${relModel.entityName}, (${relModel.single}) => ${relModel.single}.${
						relModel.oppositeField
					}, { onDelete: 'CASCADE' })
					${relModel.hasFk ? '@JoinColumn()' : ''}
					@TypeormLoader()
					${relModel.fieldName}${relModel.optionalOp}: ${relModel.entityName}${relModel.isArray ? '[]' : ''}
				`
						: `
					@Field((type) => ${relModel.isArray ? `[${relModel.entityName}]` : relModel.entityName})
					@${uc(relModel.relType)}(() => ${relModel.entityName}, (${relModel.single}) => ${relModel.single}.${
						relModel.oppositeField
					}, { onDelete: 'CASCADE' })
					@JoinTable()
					@TypeormLoader()
					${relModel.fieldName}${relModel.optionalOp}: ${relModel.entityName}${relModel.isArray ? '[]' : ''}
				`
				}
				
			`
				)
				.join('\n')}

	${
		model.auditDates
			? `
				@Field()
				@CreateDateColumn()
				createdAt!: Date

				@Field((type) => Date)
				@UpdateDateColumn({ nullable: true })
				updatedAt!: Date | null

				@Field((type) => Date)
				@DeleteDateColumn({ nullable: true })
				deletedAt!: Date | null
			`
			: ''
	}
	}
	`
}

export default tmpl
