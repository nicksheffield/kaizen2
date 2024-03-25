import ReactFlow, { Node, NodeChange, ReactFlowProvider, applyNodeChanges, useReactFlow, useStore } from 'reactflow'
import { ERDProvider } from './ERDProvider'
import { getAttrTypeRecommends, getSourceName, getTargetName, isReservedKeyword } from '@/lib/ERDHelpers'
import { useCallback, useMemo, useState } from 'react'
import { AttributeType, Model, Relation } from '@/lib/schemas'
import { ERDMarkers } from '@/components/ERDMarkers'
import { useApp } from '@/lib/AppContext'
import { ModelNode } from '@/components/ERD/ModelNode'
import { SimpleFloatingEdge } from '@/components/ERD/SimpleFloatingEdge'
import { useLocalStorage } from 'usehooks-ts'
import { ListCollapseIcon, MaximizeIcon, PlusIcon, SaveIcon, SearchIcon, ShrinkIcon, Undo2Icon } from 'lucide-react'
import { RevealButton } from '@/components/RevealButton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

export const Editor = () => {
	const { project, draft, setDraft, /*hasNewChanges, setHasNewChanges,*/ saveProject } = useApp()

	const [max, setMax] = useState(false)

	const [defaultModels, setDefaultModels] = useState(draft?.content.models || [])
	const [defaultRelations, setDefaultRelations] = useState(draft?.content.relations || [])

	const [nodes, setNodes] = useState<Node<Model>[]>(
		draft?.content.models.map((model) => ({
			id: model.id,
			type: 'model',
			position: { x: model.posX, y: model.posY },
			dragHandle: '.drag-handle',
			data: model,
			draggable: true,
		})) || []
	)

	const nodeTypes = useMemo(() => ({ model: ModelNode }), [])
	const edgeTypes = useMemo(() => ({ floating: SimpleFloatingEdge }), [])

	const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [])

	const flow = useReactFlow()

	const center = (zoom: number = 0.8) => {
		flow.fitView()
		flow.zoomTo(zoom)
	}

	const [relations, setRelations] = useState<Relation[]>(draft?.content.relations || [])
	const edges = useMemo(() => {
		return [...relations].map((rel) => {
			const markerStart = (() => {
				if (rel.type === 'oneToOne' || rel.type === 'oneToMany') {
					return rel.optional ? 'hasOne' : 'hasOneRequired'
				}
				if (rel.type === 'manyToMany' || rel.type === 'manyToOne') {
					return 'hasMany'
					// return rel.optional ? 'hasMany' : 'hasManyRequired' // when is hasManyRequired realistic?
				}
			})()

			const markerEnd = (() => {
				if (rel.type === 'oneToOne' || rel.type === 'manyToOne') {
					return rel.optional ? 'hasOne' : 'hasOneRequired'
				}
				if (rel.type === 'oneToMany' || rel.type === 'manyToMany') {
					return 'hasMany'
					// return rel.optional ? 'hasMany' : 'hasManyRequired' // when is hasManyRequired realistic?
				}
			})()

			return {
				id: rel.id,
				source: rel.sourceId,
				sourceHandle: `${rel.id}-l`,
				target: rel.targetId,
				targetHandle: `${rel.id}-target-r`,
				type: 'floating',
				markerStart,
				markerEnd,
				data: rel,
			}
		})
	}, [relations])

	const addNode = (data?: Partial<Model>) => {
		const id = crypto.randomUUID()

		const model: Model = {
			id,
			name: '',
			key: '',
			tableName: '',
			posX: 0,
			posY: 0,
			auditDates: true,
			enabled: true,
			...data,
			attributes: [
				{
					id: crypto.randomUUID(),
					name: 'id',
					type: AttributeType.uuid,
					order: 0,
					modelId: id,
					nullable: false,
					selectable: true,
					enabled: true,
					default: null,
					foreignKey: false,
				},
			],
		}

		setNodes((nds) => [
			...nds,
			{
				id,
				type: 'model',
				position: { x: 0, y: 0 },
				dragHandle: '.drag-handle',
				data: model,
				draggable: true,
			},
		])

		return model
	}

	const reset = () => {
		if (!project) return

		setDraft({ dirty: false, content: project })

		setNodes(
			project.models.map((model) => ({
				id: model.id,
				type: 'model',
				position: { x: model.posX, y: model.posY },
				dragHandle: '.drag-handle',
				data: model,
				draggable: true,
			}))
		)

		setRelations(defaultRelations)
	}

	const [detailed, setDetailed] = useLocalStorage(`project-${project?.project.id}-erd-detailed`, false)

	const isDirty = useMemo(() => {
		const models = nodes.map((x) => ({ ...x.data, posX: x.position.x, posY: x.position.y }))
		const attributes = models.flatMap((x) => x.attributes)
		const defaultAttributes = defaultModels.flatMap((x) => x.attributes)

		for (const model of models) {
			const original = defaultModels.find((x) => x.id === model.id)
			if (!original) return true

			if (model.name !== original.name) return true
			if (model.key !== original.key) return true
			if (model.tableName !== original.tableName) return true
			if (model.auditDates !== original.auditDates) return true
			if (model.posX !== original.posX) return true
			if (model.posY !== original.posY) return true
			if (model.enabled !== original.enabled) return true
		}

		for (const originalModel of defaultModels) {
			const model = models.find((x) => x.id === originalModel.id)
			if (!model) return true
		}

		for (const relation of relations) {
			const original = defaultRelations.find((x) => x.id === relation.id)
			if (!original) return true

			if (relation.type !== original.type) return true
			if (relation.sourceId !== original.sourceId) return true
			if (relation.targetId !== original.targetId) return true
			if (relation.sourceOrder !== original.sourceOrder) return true
			if (relation.targetOrder !== original.targetOrder) return true
			if (relation.sourceName !== original.sourceName) return true
			if (relation.targetName !== original.targetName) return true
			if (relation.optional !== original.optional) return true
			if (relation.enabled !== original.enabled) return true
		}

		for (const originalRelation of defaultRelations) {
			const relation = relations.find((x) => x.id === originalRelation.id)
			if (!relation) return true
		}

		for (const attr of attributes) {
			const original = defaultAttributes.find((x) => x.id === attr.id)
			if (!original) return true

			if (attr.name !== original.name) return true
			if (attr.type !== original.type) return true
			if (attr.order !== original.order) {
				return true
			}
			if (attr.nullable !== original.nullable) return true
			if (attr.selectable !== original.selectable) return true
			if (attr.default !== original.default) return true
			if (attr.enabled !== original.enabled) return true
		}

		for (const originalAttr of defaultAttributes) {
			const attr = attributes.find((x) => x.id === originalAttr.id)
			if (!attr) return true
		}
	}, [defaultModels, defaultRelations, nodes, relations])

	const conflicts = useMemo(() => {
		const messages: string[] = []

		const models = nodes.map((x) => x.data)

		const modelNameConflicts = models.some((x) => models.some((y) => y.id !== x.id && y.name === x.name))

		const attributes = models.flatMap((x) => x.attributes)
		const attributeNameConflicts = attributes.some((x) =>
			attributes.filter((y) => y.modelId === x.modelId).some((y) => y.id !== x.id && y.name === x.name)
		)

		const relationNameConflicts = relations.some((x) => {
			return relations.some((y) => {
				if (y.id === x.id) return false

				if (y.sourceId === x.sourceId) getTargetName(y, nodes) === getTargetName(x, nodes)
				if (y.targetId === x.targetId) getSourceName(y, nodes) === getSourceName(x, nodes)
			})
		})

		const attributeRelationNameConflicts = relations.some((x) => {
			return attributes.some((y) => {
				if (y.modelId === x.sourceId) return y.name === getTargetName(x, nodes)
				if (y.modelId === x.targetId) return y.name === getSourceName(x, nodes)
			})
		})

		if (modelNameConflicts || attributeNameConflicts || relationNameConflicts || attributeRelationNameConflicts) {
			messages.push('You have naming conflicts')
		}

		const incompleteRelations = relations.some((x) => !x.sourceId || !x.targetId)

		if (incompleteRelations) {
			messages.push('You have incomplete relationships')
		}

		const unnamedModels = models.some((x) => !x.name)

		if (unnamedModels) {
			messages.push('You have unnamed models')
		}

		if (models.some((x) => isReservedKeyword(x.name, true))) {
			messages.push('You have models with reserved keywords as names')
		}

		const unnamedAttrs = attributes.some((x) => !x.name)

		if (unnamedAttrs) {
			messages.push('You have unnamed attributes')
		}

		if (attributes.some((x) => isReservedKeyword(x.name))) {
			messages.push('You have attributes with reserved keywords as names')
		}

		return messages
	}, [nodes, relations])

	const attrTypeRecommends = useMemo(() => getAttrTypeRecommends(project), [project])

	const selectNodes = useStore((actions) => actions.addSelectedNodes)

	const focusOn = (node: Node<Model>) => {
		flow.fitView({ padding: 0.2, includeHiddenNodes: true, nodes: [node], duration: 400 })
		selectNodes([node.id])
	}

	const save = () => {
		if (!project) return

		saveProject({
			...project,
			models: nodes.map((x) => ({ ...x.data, posX: x.position.x, posY: x.position.y })),
			relations,
		})

		setDefaultModels(nodes.map((x) => ({ ...x.data, posX: x.position.x, posY: x.position.y })))
		setDefaultRelations(relations)
	}

	if (!project) return null

	return (
		<ERDProvider
			value={{
				project,
				nodes,
				setNodes,
				addNode,
				relations,
				setRelations,
				detailed,
				setDetailed,
				attrTypeRecommends,
				focusOn,
			}}
		>
			<div className={cn('flex flex-col flex-1 relative bg-background', max && 'fixed inset-0 z-50')}>
				<div className="pointer-events-none absolute right-0 top-0 z-20 mr-1 mt-1">
					{conflicts.length > 0 && (
						<ul className="flex flex-col gap-2 rounded bg-destructive px-2 py-1 pl-6 text-destructive-foreground">
							{conflicts.map((message) => (
								<li className="list-disc text-sm font-medium" key={message}>
									{message}
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="pointer-events-none absolute top-0 left-0 w-full grid grid-cols-[40px,1fr,40px] z-10">
					<div>
						<Popover>
							<PopoverTrigger asChild>
								<RevealButton
									variant="outline"
									icon={<SearchIcon className="w-4 h-4 shrink-0" />}
									className="rounded-full pointer-events-auto m-2 min-w-10 h-10 py-0 px-[11px] bg-background/50 backdrop-blur-sm shadow-md"
									label="Search Models"
								/>
							</PopoverTrigger>
							<PopoverContent
								side="bottom"
								align="start"
								className="bg-background/50 backdrop-blur-sm p-0"
							>
								<Command>
									<CommandInput placeholder="Search for models..." />
									<CommandList className="p-2">
										<CommandEmpty>No results found.</CommandEmpty>

										{nodes.map((x) => (
											<CommandItem key={x.id} onSelect={() => focusOn(x)} className="px-3 py-2">
												{x.data.name}
											</CommandItem>
										))}
									</CommandList>
								</Command>
								{/* <div className="flex flex-col gap-4">
									<Input
										placeholder="Search"
										value={modelFilter}
										onChange={(e) => setModelFilter(e.target.value)}
									/>

									<div className="flex flex-col gap-1">
										{nodes
											.filter((x) =>
												x.data.name.toLowerCase().includes(modelFilter.toLowerCase())
											)
											.map((x) => (
												<div
													key={x.id}
													className="px-2 py-1 rounded-lg hover:bg-primary hover:text-primary-foreground text-sm font-medium cursor-pointer"
													onClick={() => focusOn(x)}
												>
													{x.data.name}
												</div>
											))}
									</div>
								</div> */}
							</PopoverContent>
						</Popover>
					</div>

					<div className="flex justify-center">
						<div className="pointer-events-auto rounded-full h-10 bg-background/50 backdrop-blur-sm flex items-center justify-center shadow-md px-1.5 border mt-2 gap-1.5">
							<RevealButton
								variant="ghost"
								size="pip"
								onClick={() => addNode()}
								icon={<PlusIcon className="w-4 h-4" />}
								label="Add Model"
							/>
							<RevealButton
								variant="ghost"
								size="pip"
								onClick={() => center()}
								icon={<ShrinkIcon className="w-4 h-4" />}
								label="Center"
							/>
							<RevealButton
								variant="ghost"
								size="pip"
								onClick={() => setDetailed((x) => !x)}
								icon={<ListCollapseIcon className="w-4 h-4" />}
								label="Show Details"
							/>
							<RevealButton
								variant="ghost"
								size="pip"
								onClick={reset}
								icon={<Undo2Icon className="w-4 h-4" />}
								label="Reset"
							/>
							<RevealButton
								variant="ghost"
								size="pip"
								onClick={save}
								icon={<SaveIcon className="w-4 h-4" />}
								label="Save"
								revealLabel={isDirty ? 'Save Changes' : ''}
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<RevealButton
							variant="outline"
							icon={<MaximizeIcon className="w-4 h-4" />}
							className="rounded-full pointer-events-auto m-2 px-3 bg-background/50 backdrop-blur-sm shadow-md"
							label="Full Screen"
							iconSide="right"
							onClick={() => {
								setMax((x) => !x)
								setTimeout(() => center(max ? 0.8 : 1), 1)
							}}
						/>
					</div>
				</div>

				{/* {hasNewChanges && (
					<div
						className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 p-2"
						onClick={() => {
							setDefaultModels(project.models)
							setDefaultRelations(project.relations)
							setNodes(
								project.models.map((model) => ({
									id: model.id,
									type: 'model',
									position: { x: model.posX, y: model.posY },
									dragHandle: '.drag-handle',
									data: model,
									draggable: true,
								})) || []
							)
							setHasNewChanges(false)
						}}
					>
						You have unsaved changes
					</div>
				)} */}

				<ERDMarkers />

				<ReactFlow
					{...{ nodes, edges, nodeTypes, onNodesChange }}
					edgeTypes={edgeTypes}
					snapToGrid
					snapGrid={[24, 24]}
					zoomOnDoubleClick={false}
					edgesUpdatable={false}
					fitView={true}
					maxZoom={1}
					minZoom={0.1}
					deleteKeyCode={null}
					className="h-full w-full"
				>
					{/* <CustomBackground gap={12} size={3} /> */}
				</ReactFlow>
			</div>
		</ERDProvider>
	)
}

export const ERDEditor = () => {
	return (
		<ReactFlowProvider>
			<Editor />
		</ReactFlowProvider>
	)
}
