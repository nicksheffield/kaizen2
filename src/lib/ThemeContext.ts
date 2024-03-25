import { createContext, useContext } from 'react'

export type Theme = 'dark' | 'light' | 'system'

type ThemeProviderState = {
	theme: Theme
	resolvedTheme: 'dark' | 'light' | undefined
	setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
	theme: 'system',
	resolvedTheme: undefined,
	setTheme: () => null,
}

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const useTheme = () => {
	const context = useContext(ThemeProviderContext)

	if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

	return context
}
