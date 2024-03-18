import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { AppProvider } from './components/AppProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ModalProvider } from '@/components/Modal'
import { AlertProvider } from '@/components/Alert'
import { ThemeProvider } from '@/components/ThemeProvider'
import { CommandMenu } from '@/components/CommandMenu'
import { Toaster } from '@/components/ui/sonner'

import './index.css'
import 'reactflow/dist/style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<AppProvider>
				<CommandMenu />
				<ModalProvider />
				<AlertProvider />
				<Toaster />
				<TooltipProvider>
					<App />
				</TooltipProvider>
			</AppProvider>
		</ThemeProvider>
	</React.StrictMode>
)
