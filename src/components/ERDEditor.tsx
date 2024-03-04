import ReactFlow, {
	Background,
	BackgroundVariant,
	Node,
	NodeChange,
	ReactFlowProvider,
	applyNodeChanges,
	useReactFlow,
	useStore,
} from 'reactflow'
import { ERDProvider } from './ERDProvider'
import { getAttrTypeRecommends, getSourceName, getTargetName, isReservedKeyword } from '@/lib/ERDHelpers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AttributeType, Model, Relation } from '@/lib/schemas'
import { ERDMarkers } from '@/components/ERDMakers'
import { useApp } from '@/lib/AppContext'
import { ModelNode } from '@/components/ERD/ModelNode'
import { SimpleFloatingEdge } from '@/components/ERD/SimpleFloatingEdge'
import { useLocalStorage } from 'usehooks-ts'
import deepEqual from 'deep-equal'
import { Button } from '@/components/ui/button'
import { ListCollapseIcon, MaximizeIcon, PlusIcon, SaveIcon, SearchIcon, ShrinkIcon, Undo2Icon } from 'lucide-react'
import { RevealButton } from '@/components/RevealButton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const Editor = () => {
	const { project, draft, setDraft, hasNewChanges, setHasNewChanges, saveProject } = useApp()

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

	const center = () => {
		flow.fitView()
		flow.zoomTo(1)
	}

	const [relations, setRelations] = useState<Relation[]>(draft?.content.relations || [])
	const edges = useMemo(() => {
		return [...relations].map((rel) => {
			return {
				id: rel.id,
				source: rel.sourceId,
				sourceHandle: `${rel.id}-l`,
				target: rel.targetId,
				targetHandle: `${rel.id}-target-r`,
				type: 'floating',
				markerStart: rel.type === 'oneToOne' || rel.type === 'oneToMany' ? 'hasOne' : 'hasMany',
				markerEnd: rel.type === 'oneToMany' || rel.type === 'manyToMany' ? 'hasMany' : 'hasOne',
				data: rel,
			}
		})
	}, [relations])

	// if the models/relations are changed here, then save the project file
	useEffect(() => {
		if (!project) return

		const update = async () => {
			setDraft({
				dirty: true,
				content: {
					...project,
					models,
					relations,
				},
			})
			setHasNewChanges(false)
			setDefaultModels(models)
			setDefaultRelations(relations)
		}

		const models: Model[] = nodes.map((x) => ({ ...x.data, posX: x.position.x, posY: x.position.y }))

		if (!deepEqual(models, defaultModels)) update()
		if (!deepEqual(relations, defaultRelations)) update()
	}, [project, nodes])

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
			defaultModels.map((model) => ({
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

	const [modelFilter, setModelFilter] = useState('')

	const selectNodes = useStore((actions) => actions.addSelectedNodes)

	const focusOn = (node: Node<Model>) => {
		flow.fitView({ padding: 0.2, includeHiddenNodes: true, nodes: [node] })
		selectNodes([node.id])
	}

	const save = () => {
		if (!project || !draft) return

		saveProject(draft?.content)
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
			}}
		>
			<div className={cn('flex flex-col flex-1 relative bg-background', max && 'fixed inset-0')}>
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

				<div className="pointer-events-none absolute top-0 left-0 w-full grid grid-cols-[auto,1fr,auto] z-10">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="rounded-full pointer-events-auto m-2 bg-background/50 backdrop-blur-sm shadow-md"
							>
								<SearchIcon className="w-4 h-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent side="bottom" align="start" className="bg-background/50 backdrop-blur-sm">
							<div className="flex flex-col gap-4">
								<Input
									placeholder="Search"
									value={modelFilter}
									onChange={(e) => setModelFilter(e.target.value)}
								/>

								<div className="flex flex-col gap-1">
									{nodes
										.filter((x) => x.data.name.toLowerCase().includes(modelFilter.toLowerCase()))
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
							</div>
						</PopoverContent>
					</Popover>

					<div className="flex justify-center">
						<div className="pointer-events-auto rounded-full h-10 bg-background/50 backdrop-blur-sm flex items-center justify-center shadow-md px-1.5 border mt-2 gap-1.5">
							<RevealButton
								onClick={() => addNode()}
								icon={<PlusIcon className="w-4 h-4" />}
								label="Add Model"
							/>
							<RevealButton onClick={center} icon={<ShrinkIcon className="w-4 h-4" />} label="Center" />
							<RevealButton
								onClick={() => setDetailed((x) => !x)}
								icon={<ListCollapseIcon className="w-4 h-4" />}
								label="Show Details"
							/>
							<RevealButton onClick={reset} icon={<Undo2Icon className="w-4 h-4" />} label="Reset" />
							<RevealButton
								onClick={save}
								icon={<SaveIcon className="w-4 h-4" />}
								label="Save"
								revealLabel={draft?.dirty ? 'Save Changes' : ''}
							/>
						</div>
					</div>

					<Button
						variant="outline"
						size="icon"
						className="rounded-full pointer-events-auto m-2 bg-background/50 backdrop-blur-sm shadow-md"
						onClick={() => {
							setMax((x) => !x)
							setTimeout(() => center(), 1)
						}}
					>
						<MaximizeIcon className="w-4 h-4" />
					</Button>
				</div>

				{hasNewChanges && (
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
				)}

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
					<Background color="rgba(128,128,128,0.1)" gap={24} size={3} variant={BackgroundVariant.Dots} />
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
