import { AttrTypeRecommend } from '@/lib/ERDHelpers'
import type { Attribute, Model, Project, Relation } from './schemas'
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
}

export const ERDContext = createContext({} as ERDContextType)

export const useERDContext = () => useContext(ERDContext)
