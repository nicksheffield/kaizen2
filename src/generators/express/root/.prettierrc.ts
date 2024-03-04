import { ProjectCtx } from '@/generators/types'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	const useTabs = project.settings.find((x) => x.key === 'prettierTabs')?.value ?? 'true'
	const tabWidth = parseInt(project.settings.find((x) => x.key === 'prettierTabWidth')?.value ?? '4')
	const semi = project.settings.find((x) => x.key === 'prettierSemicolons')?.value ?? 'false'
	const printWidth = parseInt(project.settings.find((x) => x.key === 'prettierPrintWidth')?.value ?? '120')

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
