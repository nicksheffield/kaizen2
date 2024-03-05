import { ThemeProvider } from './components/ThemeProvider'
import { DarkModeToggle } from './components/DarkModeToggle'
import { Logo } from './components/Logo'
import { Sidebar } from './components/Sidebar'
import { EditorFrame } from './components/EditorFrame'
import { StatusBar } from '@/components/StatusBar'
import { VersionControl } from '@/components/VersionControl'

export const App = () => {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<div className="flex flex-col divide-y h-screen overflow-hidden">
				<div className="flex items-center justify-between p-4 overflow-hidden">
					<div className="pl-[4.5rem]">
						<Logo />
					</div>
					<div className="flex items-center gap-4">
						<DarkModeToggle />
					</div>
				</div>

				<div className="flex-1 grid grid-cols-[300px,1fr,300px] divide-x min-h-0 max-w-full">
					<Sidebar />

					<EditorFrame />

					<VersionControl />
				</div>

				<StatusBar />
			</div>
		</ThemeProvider>
	)
}
