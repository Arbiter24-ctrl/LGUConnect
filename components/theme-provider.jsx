'use client'

import *  from 'react'
import {
  ThemeProvider ,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
