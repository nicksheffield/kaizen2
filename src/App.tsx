import { ThemeProvider } from './components/ThemeProvider'
import { DarkModeToggle } from './components/DarkModeToggle'
import { Logo } from './components/Logo'
import { Sidebar } from './components/Sidebar'
import { EditorFrame } from './components/EditorFrame'

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

				<div className="flex-1 flex flex-row divide-x min-h-0">
					<Sidebar />

					<EditorFrame />
				</div>
			</div>
		</ThemeProvider>
	)
}
