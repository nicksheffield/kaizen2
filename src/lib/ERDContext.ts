import { AttrTypeRecommend } from '@/lib/ERDHelpers'
import type { Attribute, Model, Project, Relation } from './projectSchemas'
import { type Dispatch, type SetStateAction, createContext, useContext } from 'react'
import { type Node } from 'reactflow'

export type ExtendedModel = Model & { attributes: Attribute[] }

type ERDContextType = {
	project: Project
	nodes: Node<ExtendedModel>[]
	setNodes: Dispatch<SetStateAction<Node<ExtendedModel>[]>>
	addNode: (data?: Partial<Model>) => ExtendedModel
	relations: Relation[]
	setRelations: Dispatch<SetStateAction<Relation[]>>
	detailed: boolean
	setDetailed: Dispatch<SetStateAction<boolean>>
	attrTypeRecommends: AttrTypeRecommend[]
	focusOn: (node: Node<Model>) => void
	userModelId: string
	setUserModelId: (id: string) => void
}

export const ERDContext = createContext({} as ERDContextType)

export const useERDContext = () => useContext(ERDContext)
