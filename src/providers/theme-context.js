import { createContext, useContext } from 'react'

export const ThemeContext = createContext(null)

export const useAppTheme = () => {
  const value = useContext(ThemeContext)
  if (!value) {
    throw new Error('useAppTheme must be used within ThemeProvider')
  }
  return value
}
