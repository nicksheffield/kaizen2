import { getEmptyProject } from '@/lib/utils'
import isoGit from 'isomorphic-git'
import { FsaNodeFs } from 'memfs/lib/fsa-to-node'

const dir = ''

export const git = {
	init: async (fs: FsaNodeFs) => {
		try {
			await isoGit.init({ fs, dir, defaultBranch: 'main' })

			await fs.promises.writeFile('/project.json', JSON.stringify(getEmptyProject(), null, 4))

			await isoGit.add({ fs, dir: '', filepath: 'project.json' })

			await isoGit.commit({
				fs,
				dir,
				author: { name: 'Kaizen', email: 'nick@applicable.co.nz' },
				message: 'initial commit',
			})
		} catch (error) {
			console.log(error)
			console.log((error as Error).name)
		}
	},
	branch: async (fs: FsaNodeFs, ref: string) => {
		try {
			await isoGit.branch({ fs, dir, ref, checkout: true })
		} catch (error) {
			console.log(error)
			console.log((error as Error).name)
		}
	},
	checkout: async (fs: FsaNodeFs, ref: string) => {
		try {
			const files = (await fs.promises.readdir('')).filter((x) => x !== '.git')
			for (const path of files) {
				await fs.promises.unlink(path as string)
			}
			await isoGit.checkout({ fs, dir, ref, force: true })
		} catch (error) {
			console.dir(error)
			console.log((error as Error).name)
		}
	},
}
