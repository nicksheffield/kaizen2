import { Logo } from './components/Logo'
import { Sidebar } from './components/Sidebar'
import { EditorFrame } from './components/EditorFrame'
import { useApp } from '@/lib/AppContext'
import { UserMenu } from '@/components/UserMenu'

export const Project = () => {
	const selectedPath = useApp((v) => v.selectedPath)

	return (
		<div className="flex h-screen flex-col divide-y overflow-hidden">
			<div className="flex items-center justify-between overflow-hidden p-4">
				<div className="pl-[4.5rem]">
					<Logo />
				</div>
				<div className="flex items-center gap-4">
					<UserMenu />
				</div>
			</div>

			<div className="flex min-h-0 max-w-full flex-1 flex-row divide-x">
				<div className="flex w-[300px] shrink-0 flex-col">
					<Sidebar />
				</div>

				<EditorFrame key={selectedPath} />

				{/* <div className="w-[300px] shrink-0 flex flex-col">
					<VersionControl />
				</div> */}
			</div>

			{/* <StatusBar /> */}
		</div>
	)
}
