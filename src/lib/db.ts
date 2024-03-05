import Dexie, { Table } from 'dexie'

export interface DbDir {
	id?: number
	handle: FileSystemDirectoryHandle
}

export class MySubClassedDexie extends Dexie {
	dirs!: Table<DbDir>

	constructor() {
		super('kaizen')
		this.version(1).stores({
			dirs: '++id, handle', // Primary key and indexed props
		})
	}
}

export const db = new MySubClassedDexie()
