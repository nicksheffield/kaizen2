import { createContext, useContext } from 'react'

export type AppThemeContextType = {
	appTheme: string
	setAppTheme: (theme: string) => void
}

export const AppThemeContext = createContext<AppThemeContextType>({} as AppThemeContextType)

export const useAppTheme = () => useContext(AppThemeContext)
