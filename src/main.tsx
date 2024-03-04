import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { AppProvider } from './components/AppProvider.tsx'

import './index.css'
import 'reactflow/dist/style.css'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppProvider>
			<TooltipProvider>
				<App />
			</TooltipProvider>
		</AppProvider>
	</React.StrictMode>
)
