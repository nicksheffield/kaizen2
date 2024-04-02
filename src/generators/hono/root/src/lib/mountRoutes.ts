const tmpl = () => `import { Hono } from 'hono'
import { stat, readdir } from 'node:fs/promises'
import { join } from 'node:path'

// Do some file based routing.
// A recursive function that looks through folders for ts files that have a "router" export, and mounts them
export const mountRoutes = async (path: string, startPoint: string = '') => {
	const app = new Hono().basePath(path.split('/').pop() || '')

	const dirPath = join(startPoint, path)

	const files = await readdir(dirPath)

	// sort the files so ones with "get" in the filename come first, then "create", then "update", then "delete"
	// this is so they're ordered right in swagger
	// @TODO: sort :id routes to the end
	const sortedFiles = files.sort((a, b) => {
		if (a.includes('get')) return -1
		if (b.includes('get')) return 1
		if (a.includes('create')) return -1
		if (b.includes('create')) return 1
		if (a.includes('update')) return -1
		if (b.includes('update')) return 1
		if (a.includes('delete')) return -1
		if (b.includes('delete')) return 1
		return 0
	})

	for (const file of sortedFiles) {
		const filePath = join(dirPath, file)
		const fileInfo = await stat(filePath)

		if (fileInfo.isFile()) {
			const router = await import(filePath)

			if (router.router) {
				app.route('/', router.router)
			}
			continue
		}

		if (fileInfo.isDirectory()) {
			const router = await mountRoutes(file, dirPath)
			app.route('/', router)
		}
	}

	return app
}
`

export default tmpl
