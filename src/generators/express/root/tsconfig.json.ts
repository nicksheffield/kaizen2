const tmpl = () => {
	const tsConfigJson = {
		compilerOptions: {
			target: 'es5',
			lib: ['es2018', 'esnext.asynciterable'],
			allowJs: true,
			outDir: 'build',
			rootDir: 'src',
			strict: true,
			noImplicitAny: true,
			esModuleInterop: true,
			emitDecoratorMetadata: true,
			experimentalDecorators: true,
			resolveJsonModule: true,
			baseUrl: 'src',
			paths: {
				'~/*': ['./*'],
			},
		},
		include: ['**/*.ts'],
	}

	return JSON.stringify(tsConfigJson, null, 4)
}

export default tmpl
