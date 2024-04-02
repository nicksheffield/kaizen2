'use client'

import { Dispatch, SetStateAction } from 'react'
import { useUpdateNodeInternals, type NodeProps } from 'reactflow'
import { camelize, cn, generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CalendarIcon, LinkIcon, LockIcon, PlusIcon, SettingsIcon, SparklesIcon, Trash2Icon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useERDContext } from '@/lib/ERDContext'
import { Tooltip } from '@/components/Tooltip'
import { Separator } from '@/components/ui/separator'
import { z } from 'zod'
import { PanelRow } from './PanelRow'
import { FieldRow } from './FieldRow'
import { AttributeRow } from './AttributeRow'
import { RelationRow } from './RelationRow'
import { Attribute, Model as BasicModel, AttributeType, RelationType, Relation } from '@/lib/schemas'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { useModelField } from '@/lib/useModelField'
import { isReservedKeyword } from '@/lib/ERDHelpers'
import { plural } from 'pluralize'

type Model = BasicModel & {
	attributes: Attribute[]
}

const AttrType = z.enum(['id', 'a_i', 'text', 'password', 'int', 'float', 'boolean', 'datetime', 'date', 'time'])

const validateSuggestionType = (suggestion?: string) => {
	const validation = AttrType.safeParse(suggestion)
	if (validation.success) {
		return validation.data
	}
}

const isModelLocked = (model: Model) => {
	if (model.key === 'user') return true
	return false
}

export const ModelNode = ({ data, selected }: NodeProps<Model>) => {
	const { project, userModelId, setUserModelId, nodes, setNodes, detailed, relations, setRelations } = useERDContext()

	const hasUserModel = nodes.some((x) => x.data.id === userModelId)

	// const titleHSL = hexToCssHsl(data.color || stringToColor(data.name))
	// const getTitleBG = (hsl: ReturnType<typeof hexToCssHsl>) => `hsl(${hsl.h},90%, ${hsl.l}%, 50%)`

	const sourceRelations = relations.filter((x) => x.sourceId === data.id) //.sort((a) => new Date(a.createdAt).valueOf())
	const targetRelations = relations.filter((x) => x.targetId === data.id) //.sort((a) => new Date(a.createdAt).valueOf())

	const [name, setName] = useModelField(data.id, 'name')
	const [key, setKey] = useModelField(data.id, 'key')
	const [tableName, setTableName] = useModelField(data.id, 'tableName')
	const isUserModel = key === 'user'

	const keyPlaceholder = camelize(name)
	const tablePlaceholder = plural(camelize(name))

	const removeSelf = () => {
		setNodes((prev) => prev.filter((n) => n.id !== data.id))
		setRelations((prev) => prev.filter((r) => r.sourceId !== data.id && r.targetId !== data.id))
	}

	const updateModel = (model: Model) => {
		setNodes((prev) => {
			const index = prev.findIndex((n) => n.id === model.id)
			if (index === -1) return prev

			const newNodes = [...prev]
			const node = newNodes[index]
			if (!node) return prev
			newNodes[index] = { ...node, data: model }
			return newNodes
		})
	}

	const updateModelField = (field: keyof Model, value: Model[typeof field]) => {
		updateModel({ ...data, [field]: value })
	}

	const addAttribute = (suggestion?: { name: string; type: string }) => {
		updateModel({
			...data,
			attributes: [
				...data.attributes,
				{
					id: generateId(),
					name: suggestion?.name || '',
					type: validateSuggestionType(suggestion?.type) || AttributeType.text,
					order: data.attributes.length,
					modelId: data.id,
					nullable: false,
					selectable: true,
					insertable: true,
					default: '',
					enabled: true,
					foreignKey: false,
				},
			],
		})
	}

	const removeAttribute = (id: Attribute['id']) => {
		const attr = data.attributes.find((a) => a.id === id)

		if (!attr) return

		updateModel({
			...data,
			attributes: data.attributes
				.filter((a) => a.id !== id)
				.map((x) => ({
					...x,
					order: x.order > attr.order ? x.order - 1 : x.order,
				})),
		})
	}

	const updateAttribute = (attr: Model['attributes'][number]) => {
		updateModel({
			...data,
			attributes: data.attributes.map((a) => (a.id === attr.id ? attr : a)),
		})
	}

	const updateAttributeField = (
		attr: Model['attributes'][number],
		field: keyof Model['attributes'][number],
		value: Model['attributes'][number][typeof field]
	) => {
		updateAttribute({ ...attr, [field]: value })
	}

	const addRelation = () => {
		if (!project) return

		setRelations((prev) => {
			const newRel = {
				id: generateId(),
				type: RelationType.manyToOne,
				sourceName: '',
				targetName: '',
				sourceOrder: sourceRelations.length + targetRelations.length,
				targetOrder: 99,
				optional: false,
				enabled: true,
				sourceId: data.id,
				targetId: '',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}

			return [...prev, newRel]
		})
	}

	const attrs = data.attributes.filter((x) => detailed || x.name !== 'id')

	const nameConflicted =
		nodes
			.map((x) => x.data)
			.filter((x) => x.id !== data.id)
			.some((x) => x.name === data.name) || isReservedKeyword(data.name, true)

	return (
		<div
			className={cn(
				'flex min-w-[216px] cursor-default flex-col overflow-hidden rounded-md border bg-background transition-shadow dark:border',
				selected && 'ring-2 ring-ring ring-offset-2 ring-offset-muted dark:ring-offset-background',
				!data.enabled && 'opacity-50'
			)}
		>
			<div className="mb-[12px] p-0">
				<div
					className={cn(
						'drag-handle flex h-[36px] cursor-grab items-center justify-between border-b bg-background pl-3 pr-2 text-foreground active:cursor-grabbing',
						selected && 'text-primary dark:text-primary'
					)}
					// style={{ background: getTitleBG(titleHSL), color: 'black' }}
				>
					{data.name ? (
						<div className={cn(nameConflicted && 'text-destructive')}>{data.name}</div>
					) : (
						<div className="italic text-destructive">New Model</div>
					)}

					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="xs"
								className="h-6 w-6 rounded-full px-0 dark:hover:bg-foreground/10"
							>
								<SettingsIcon className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>

						<PopoverContent align="center" side="right">
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between pb-3">
									<div>Model Settings</div>

									<div className="flex items-center gap-2">
										{isModelLocked(data) ? (
											<Button variant="ghost" size="xs">
												<LockIcon className="h-4 w-4" />
											</Button>
										) : (
											<Button
												variant="ghost"
												size="xs"
												onClick={() => {
													removeSelf()
												}}
											>
												<Trash2Icon className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>

								{!hasUserModel && (
									<div className="flex flex-col gap-2 rounded-md border p-2">
										<Button
											size="sm"
											onClick={() => {
												setUserModelId(data.id)
											}}
										>
											Set as Auth Model
										</Button>
										<div className="rounded-md bg-muted p-2 text-sm text-muted-foreground">
											The auth model comes with a set of required attributes.
										</div>
									</div>
								)}

								<PanelRow label="Name" hint="The name of the model used for...">
									<Input
										value={name}
										onChange={(e) => {
											setName(e.currentTarget.value.replace(/\s/g, ''))
										}}
										size="sm"
										autoFocus
									/>
								</PanelRow>

								<PanelRow label="Key" hint="The name of the model used in code">
									<Input
										value={key}
										onChange={(e) => {
											setKey(e.currentTarget.value)
										}}
										size="sm"
										disabled={isModelLocked(data)}
										placeholder={keyPlaceholder}
									/>
								</PanelRow>

								<PanelRow label="Table" hint="The name of the database table">
									<Input
										value={tableName}
										onChange={(e) => setTableName(e.currentTarget.value)}
										placeholder={tablePlaceholder}
										size="sm"
									/>
								</PanelRow>

								<PanelRow label="Audit Dates" hint="Whether to include createdAt, etc">
									<Switch
										checked={data.auditDates}
										onCheckedChange={(val) => updateModelField('auditDates', val)}
									/>
								</PanelRow>

								<PanelRow
									label="Enabled"
									hint="If set to false, this model will be omitted from the generated app and db schema"
								>
									<Switch
										checked={data.enabled}
										onCheckedChange={(val) => updateModelField('enabled', val)}
										disabled={isUserModel}
									/>
								</PanelRow>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			<div
				className={cn(
					'flex flex-col gap-[12px]',
					sourceRelations.length + targetRelations.length + attrs.length === 0 && 'min-h-[80px]'
				)}
			>
				{attrs.length > 0 && (
					<Attributes
						model={data}
						detailed={detailed}
						remove={(id) => removeAttribute(id)}
						updateAttributes={(attrs) => updateModel({ ...data, attributes: attrs })}
						updateAttributeField={updateAttributeField}
					/>
				)}

				{sourceRelations.length + targetRelations.length > 0 && (
					<>
						{attrs.length > 0 && <Separator />}

						<div className={cn(attrs.length > 0 && '-mt-px')}>
							<Relations
								model={data}
								sourceRelations={sourceRelations.map((x) => ({ ...x, dir: 'source' }))}
								targetRelations={targetRelations.map((x) => ({ ...x, dir: 'target' }))}
								updateRelations={setRelations}
							/>
						</div>
					</>
				)}

				{!detailed && attrs.length + sourceRelations.length + targetRelations.length === 0 && (
					<div className="flex flex-1 items-center justify-center">
						<SparklesIcon className="h-10 w-10 opacity-10" />
					</div>
				)}

				{data.auditDates && detailed && (
					<>
						<Separator />

						<div className="flex flex-col px-2">
							<FieldRow title="createdAt" type="datetime" icon={CalendarIcon} />
							<FieldRow title="updatedAt?" type="datetime" icon={CalendarIcon} />
							<FieldRow title="deletedAt?" type="datetime" icon={CalendarIcon} />
						</div>
					</>
				)}
			</div>

			<div className="mt-[10px] flex h-[34px] items-center justify-between gap-2 border-t px-2">
				<div className="flex gap-2">
					<Tooltip content="Add Attribute" delayDuration={0} side="bottom">
						<Button
							variant="outline"
							size="xs"
							className="h-6 w-6 rounded-full px-0"
							onClick={() => addAttribute()}
						>
							<PlusIcon className="h-3 w-3" />
						</Button>
					</Tooltip>

					<Tooltip content="Add Relationship" delayDuration={0} side="bottom">
						<Button
							variant="outline"
							size="xs"
							className="h-6 w-6 rounded-full px-0"
							onClick={() => addRelation()}
						>
							<LinkIcon className="h-3 w-3" />
						</Button>
					</Tooltip>
				</div>

				{/* <Tooltip
					content={<span className="text-indigo-500 dark:text-amber-500">AI Suggestions</span>}
					delayDuration={0}
					side="bottom"
				>
					<div>
						<SuggestionPopover
							modelName={data.name}
							attributeNames={data.attributes.map((x) => x.name)}
							onAcceptSuggestion={(suggestion) => {
								return addAttribute(suggestion)
							}}
						>
							<Button
								variant="outline"
								size="xs"
								className="h-6 w-6 rounded-full px-0 hover:text-indigo-500 dark:hover:text-amber-500"
							>
								<LightbulbIcon className="h-3 w-3" />
							</Button>
						</SuggestionPopover>
					</div>
				</Tooltip> */}
			</div>
		</div>
	)
}

type AttributesProps = {
	model: Model
	detailed: boolean
	remove: (id: string) => void
	updateAttributeField: (
		attr: Model['attributes'][number],
		field: keyof Model['attributes'][number],
		value: Model['attributes'][number][typeof field]
	) => void
	updateAttributes: (attrs: Model['attributes']) => void
}

const Attributes = ({ model, detailed, remove, updateAttributeField, updateAttributes }: AttributesProps) => {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	const sorted = model.attributes.filter((x) => x.name !== 'id').sort((a, b) => (a.order > b.order ? 1 : -1))

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		let items = [...sorted]

		if (active.id !== over?.id) {
			const oldIndex = items.findIndex((x) => x.id === active.id)
			const newIndex = items.findIndex((x) => x.id === over?.id)

			items = arrayMove(items, oldIndex, newIndex)

			updateAttributes(
				model.attributes.map((x) => {
					const order = items.findIndex((y) => y.id === x.id) || 0

					return { ...x, order: x.name === 'id' ? -1 : order }
				})
			)
		}
	}

	const idRow = model.attributes.find((x) => x.name === 'id')

	return (
		<div className="flex flex-col">
			{idRow && detailed && (
				<AttributeRow
					attr={idRow}
					model={model}
					remove={() => remove(idRow.id)}
					updateField={(field, value) => updateAttributeField(idRow, field, value)}
				/>
			)}

			<div className="flex flex-col">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
					modifiers={[restrictToVerticalAxis, restrictToParentElement]}
				>
					<SortableContext items={sorted} strategy={verticalListSortingStrategy}>
						{sorted
							.filter((x) => x !== idRow)
							.map((attr) => (
								<AttributeRow
									key={attr.id}
									attr={attr}
									model={model}
									remove={() => remove(attr.id)}
									updateField={(field, value) => updateAttributeField(attr, field, value)}
								/>
							))}
					</SortableContext>
				</DndContext>
			</div>
		</div>
	)
}

type SourceRelation = Relation & { dir: 'source' }
type TargetRelation = Relation & { dir: 'target' }

type RelationsProps = {
	model: Model
	sourceRelations: SourceRelation[]
	targetRelations: TargetRelation[]
	updateRelations: Dispatch<SetStateAction<Relation[]>>
}

const Relations = ({ model, sourceRelations, targetRelations, updateRelations }: RelationsProps) => {
	const updateNodeInternals = useUpdateNodeInternals()

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	const sorted = [...sourceRelations, ...targetRelations].sort((a, b) => {
		const aOrder = a.dir === 'source' ? a.targetOrder : a.sourceOrder
		const bOrder = b.dir === 'source' ? b.targetOrder : b.sourceOrder

		return aOrder > bOrder ? 1 : -1
	})

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		let items = [...sorted]

		if (active.id !== over?.id) {
			const oldIndex = items.findIndex((x) => x.id === active.id)
			const newIndex = items.findIndex((x) => x.id === over?.id)

			items = arrayMove(items, oldIndex, newIndex)

			updateRelations((old) =>
				old.map((x) => {
					const order = items.findIndex((y) => y.id === x.id) || 0
					const dirred = sorted.find((y) => y.id === x.id)

					if (dirred?.dir === 'source') return { ...x, targetOrder: order }
					if (dirred?.dir === 'target') return { ...x, sourceOrder: order }

					return x
				})
			)
		}
		setTimeout(() => {
			updateNodeInternals(model.id)
		}, 100)
	}

	return (
		<div className="flex flex-col">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				onDragMove={() => {
					updateNodeInternals(model.id)
				}}
				modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			>
				<SortableContext items={sorted} strategy={verticalListSortingStrategy}>
					{sorted.map((rel) => (
						<RelationRow key={rel.id} rel={rel} model={model} mode={rel.dir} />
					))}
				</SortableContext>
			</DndContext>
		</div>
	)
}
