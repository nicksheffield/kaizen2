export type DirDesc = {
	type: 'directory'
	name: string
	path: string
	handle?: FileSystemDirectoryHandle | null
}

export type FileDesc = {
	type: 'file'
	name: string
	path: string
	extension: string
	content: string
	handle?: FileSystemFileHandle | null
}

export type FSDesc = DirDesc | FileDesc

export const isFile = (x: any): x is FileDesc => typeof x === 'object' && x.hasOwnProperty('type') && x.type === 'file'
export const isDir = (x: any): x is DirDesc =>
	typeof x === 'object' && x.hasOwnProperty('type') && x.type === 'directory'

export const sortFilesByPath = (a: FSDesc, b: FSDesc) => {
	if (a.type === 'directory' && b.type === 'file') return -1
	if (a.type === 'file' && b.type === 'directory') return 1
	return a.path.localeCompare(b.path)
}

const skip = ['node_modules', '.next', '.vscode', '.DS_Store', 'objects']

// Get a tree of Desc objects by recursively traversing a directory handle
export const getHandleTreeFromHandle = async (
	dirHandle: FileSystemDirectoryHandle,
	path: string = ''
): Promise<FSDesc[]> => {
	const entries = dirHandle.values()
	let entriesArray: FSDesc[] = []

	for await (const entry of entries) {
		if (skip.includes(entry.name)) continue
		if (entry.name.endsWith('.crswap')) continue

		const nextPath = [path, entry.name].filter((x) => x !== '').join('/')
		if (entry.kind === 'directory') {
			const subFiles = await getHandleTreeFromHandle(entry, nextPath)
			entriesArray = [...entriesArray, ...subFiles]
		} else {
			const file = await entry.getFile()
			entriesArray = [
				...entriesArray,
				{
					name: entry.name,
					path: nextPath,
					type: 'file',
					extension: entry.name.split('.').pop() || '.txt',
					content: await file.text(),
					handle: await dirHandle.getFileHandle(entry.name),
				},
			]
		}
	}

	return [
		{
			name: dirHandle.name,
			path,
			type: 'directory',
			handle: dirHandle,
		},
		...entriesArray,
	]
}

export const getDirHandle = async (
	path: string,
	rootHandle: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle | null> => {
	const parts = path.split('/').filter((x) => x !== '')

	if (parts.length === 0) return rootHandle

	const nextDir = await rootHandle.getDirectoryHandle(parts[0], { create: true })
	return getDirHandle(parts.slice(1).join('/'), nextDir)
}

export const getFileHandle = async (path: string, rootHandle: FileSystemDirectoryHandle) => {
	if (!rootHandle) return null

	const checkDir = async (path: string, dir: FileSystemDirectoryHandle): Promise<FileSystemFileHandle | null> => {
		const parts = path.split('/').filter((x) => x !== '')

		if (parts.length === 1) {
			return dir.getFileHandle(path.split('/').pop() || '', { create: true })
		}

		const nextDir = await dir.getDirectoryHandle(parts[0], { create: true })
		return checkDir(parts.slice(1).join('/'), nextDir)
	}

	const newHandle = await checkDir(path, rootHandle)

	return newHandle
}

export const write = async (fileHandle: FileSystemFileHandle, content: string) => {
	const writable = await fileHandle.createWritable({ keepExistingData: false })
	await writable.write(content)
	await writable.close()
}

export const mkdir = async (dirHandle: FileSystemDirectoryHandle, name: string) => {
	await dirHandle.getDirectoryHandle(name, { create: true })
}

export const rm = async (dirHandle: FileSystemDirectoryHandle, name: string) => {
	await dirHandle.removeEntry(name, { recursive: true })
}

export const convertGeneratedFilesToDescs = async (
	generated: Record<string, string>,
	rootHandle: FileSystemDirectoryHandle
) => {
	const items: FileDesc[] = []

	const entries = Object.entries(generated)

	for (const [path, content] of entries) {
		items.push({
			type: 'file',
			name: path.split('/').pop() || '',
			path: `build${path}`,
			extension: path.split('.').pop() || '.txt',
			content,
			handle: await getFileHandle(`build/${path}`, rootHandle),
		})
	}

	return items
}

export const syncFiles = async (files: FileDesc[], newFiles: FileDesc[], rootHandle: FileSystemDirectoryHandle) => {
	const sortedFiles = files.sort(sortFilesByPath)
	const sortedNewFiles = newFiles.sort(sortFilesByPath)

	// console.log({
	// 	sortedFiles,
	// 	sortedNewFiles,
	// })

	// return

	// look through all the new files
	for (const newFile of sortedNewFiles) {
		const found = sortedFiles.find((x) => x.path === newFile.path)

		// if this new file is not in the old files, add it
		if (!found) {
			if (!newFile.handle) continue

			if (isDir(newFile)) {
				// don't add new folders
				// console.log('adding dir', newFile.handle, newFile.name)
				// mkdir(newFile.handle, newFile.name)
			} else {
				console.log('adding file', newFile.path)
				write(newFile.handle, newFile.content)
			}
		} else {
			// if the file is in the old files, update it
			if (!isFile(newFile) || !isFile(found)) continue

			if (newFile.content !== found.content) {
				if (newFile.handle) {
					console.log('updating file', newFile.path)
					write(newFile.handle, newFile.content)
				}
			}
		}
	}

	// look through all the old files
	for (const file of sortedFiles) {
		const found = sortedNewFiles.find((x) => x.path === file.path)

		// if this old file is not in the new files, delete it
		if (!found) {
			if (!file.handle) continue

			console.log('deleting file', file.path)
			const parentDir = await getDirHandle(file.path.split('/').slice(0, -1).join('/'), rootHandle)
			parentDir?.removeEntry(file.name)
		}
	}
}
