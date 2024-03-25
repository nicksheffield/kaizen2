import { DarkModeToggle } from './components/DarkModeToggle'
import { Logo } from './components/Logo'
import { Sidebar } from './components/Sidebar'
import { EditorFrame } from './components/EditorFrame'
import { useApp } from '@/lib/AppContext'

export const Project = () => {
	const { selectedPath } = useApp()

	return (
		<div className="flex flex-col divide-y h-screen overflow-hidden">
			<div className="flex items-center justify-between p-4 overflow-hidden">
				<div className="pl-[4.5rem]">
					<Logo />
				</div>
				<div className="flex items-center gap-4">
					<DarkModeToggle />
				</div>
			</div>

			<div className="flex-1 flex flex-row divide-x min-h-0 max-w-full">
				<div className="w-[300px] shrink-0 flex flex-col">
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
