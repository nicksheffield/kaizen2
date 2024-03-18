import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const useTabs = project.formatSettings?.prettierTabs ?? true
	const tabWidth = project.formatSettings?.prettierTabWidth ?? 4
	const semi = project.formatSettings?.prettierSemicolons ?? false
	const printWidth = project.formatSettings?.prettierPrintWidth ?? 120

	const prettierRc = {
		tabWidth,
		useTabs,
		singleQuote: true,
		semi,
		printWidth,
		trailingComma: 'es5',
		arrowParens: 'always',
	}

	return JSON.stringify(prettierRc, null, 4)
}

export default tmpl
