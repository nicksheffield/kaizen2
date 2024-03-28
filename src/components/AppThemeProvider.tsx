import { PropsWithChildren, useEffect, useState } from 'react'
import { AppThemeContext } from '@/lib/AppThemeContext'
import { useLocalStorage } from 'usehooks-ts'

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
	const [appTheme, setAppTheme] = useLocalStorage('app-theme', '')
	const [prevTheme, setPrevTheme] = useState(appTheme)

	useEffect(() => {
		window.document.documentElement.classList.remove(`theme-${prevTheme}`)
		window.document.documentElement.classList.add(`theme-${appTheme}`)

		setPrevTheme(appTheme)
	}, [appTheme])

	return (
		<AppThemeContext.Provider
			value={{
				appTheme,
				setAppTheme,
			}}
		>
			{children}
		</AppThemeContext.Provider>
	)
}
