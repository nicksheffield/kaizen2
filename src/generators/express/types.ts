import { ModelCtx } from './contexts'

export type ModelTemplateFn = ({ model }: { model: ModelCtx }) => string
