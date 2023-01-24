import { usePrefersColorScheme } from 'use-prefers-color-scheme'

export const useTheme = (colorScheme: 'dark' | 'light' | 'system') => {
  const preferedColorScheme = usePrefersColorScheme()
  if (colorScheme === 'system') {
    if (preferedColorScheme === 'no-preference') return 'light'
    return preferedColorScheme
  }
  return colorScheme
}

export type ThemeProps = {
  colorScheme?: 'dark' | 'light' | 'system'
  className?: string
}
