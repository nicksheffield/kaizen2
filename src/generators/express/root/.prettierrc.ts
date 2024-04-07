const tmpl = () => {
	const prettierRc = {
		tabWidth: 4,
		useTabs: true,
		singleQuote: true,
		semi: false,
		printWidth: 120,
		trailingComma: 'es5',
		arrowParens: 'always',
	}

	return JSON.stringify(prettierRc, null, 4)
}

export default tmpl
