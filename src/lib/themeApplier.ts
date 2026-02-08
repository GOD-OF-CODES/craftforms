/**
 * Theme application utility for public forms
 */

import { getGoogleFontsUrl, getFontFamilyValue } from './googleFonts'

export interface ThemeColors {
  primary: string
  primaryText: string
  background: string
  text: string
  secondaryText: string
  error: string
  success: string
}

export interface ThemeFonts {
  questionFamily: string
  questionSize: string
  questionWeight: string
  answerFamily: string
  answerSize: string
  answerWeight: string
  buttonFamily: string
  buttonSize: string
  buttonWeight: string
}

export interface ThemeBackground {
  type: 'solid' | 'gradient' | 'image'
  color?: string
  gradient?: {
    from: string
    to: string
    direction: string
  }
  imageUrl?: string
  opacity?: number
  blur?: number
}

export interface ThemeLayout {
  alignment: 'left' | 'center' | 'right'
  containerWidth: 'narrow' | 'medium' | 'wide' | 'full'
  spacing: 'compact' | 'normal' | 'relaxed'
  buttonShape: 'rounded' | 'pill' | 'square'
  buttonSize: 'small' | 'medium' | 'large'
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
  fonts: ThemeFonts
  background?: ThemeBackground
  layout?: ThemeLayout
  backgroundImage?: string | null
}

// Default theme values
export const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Default',
  colors: {
    primary: '#6366f1',
    primaryText: '#ffffff',
    background: '#ffffff',
    text: '#1f2937',
    secondaryText: '#6b7280',
    error: '#ef4444',
    success: '#22c55e',
  },
  fonts: {
    questionFamily: 'Inter',
    questionSize: '24px',
    questionWeight: '600',
    answerFamily: 'Inter',
    answerSize: '18px',
    answerWeight: '400',
    buttonFamily: 'Inter',
    buttonSize: '16px',
    buttonWeight: '500',
  },
  background: {
    type: 'solid',
    color: '#ffffff',
  },
  layout: {
    alignment: 'center',
    containerWidth: 'medium',
    spacing: 'normal',
    buttonShape: 'rounded',
    buttonSize: 'medium',
  },
}

/**
 * Generate CSS variables from theme
 */
export function generateThemeCSSVariables(theme: Partial<Theme>): Record<string, string> {
  const colors = { ...DEFAULT_THEME.colors, ...theme.colors }
  const fonts = { ...DEFAULT_THEME.fonts, ...theme.fonts }
  const layout = { ...DEFAULT_THEME.layout, ...theme.layout }

  return {
    // Colors
    '--theme-primary': colors.primary,
    '--theme-primary-text': colors.primaryText,
    '--theme-background': colors.background,
    '--theme-text': colors.text,
    '--theme-secondary-text': colors.secondaryText,
    '--theme-error': colors.error,
    '--theme-success': colors.success,

    // Question typography
    '--theme-question-font': getFontFamilyValue(fonts.questionFamily),
    '--theme-question-size': fonts.questionSize,
    '--theme-question-weight': fonts.questionWeight,

    // Answer typography
    '--theme-answer-font': getFontFamilyValue(fonts.answerFamily),
    '--theme-answer-size': fonts.answerSize,
    '--theme-answer-weight': fonts.answerWeight,

    // Button typography
    '--theme-button-font': getFontFamilyValue(fonts.buttonFamily),
    '--theme-button-size': fonts.buttonSize,
    '--theme-button-weight': fonts.buttonWeight,

    // Layout
    '--theme-alignment': layout?.alignment || 'center',
    '--theme-container-width':
      layout?.containerWidth === 'narrow' ? '480px'
      : layout?.containerWidth === 'wide' ? '800px'
      : layout?.containerWidth === 'full' ? '100%'
      : '640px',
    '--theme-spacing':
      layout?.spacing === 'compact' ? '16px'
      : layout?.spacing === 'relaxed' ? '48px'
      : '32px',
    '--theme-button-radius':
      layout?.buttonShape === 'pill' ? '9999px'
      : layout?.buttonShape === 'square' ? '0'
      : '8px',
    '--theme-button-padding':
      layout?.buttonSize === 'small' ? '8px 16px'
      : layout?.buttonSize === 'large' ? '16px 32px'
      : '12px 24px',
  }
}

/**
 * Generate CSS string from theme
 */
export function generateThemeCSS(theme: Partial<Theme>): string {
  const variables = generateThemeCSSVariables(theme)

  const cssVars = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  return `:root {\n${cssVars}\n}`
}

/**
 * Generate background CSS from theme
 */
export function generateBackgroundCSS(theme: Partial<Theme>): React.CSSProperties {
  const background = theme.background || DEFAULT_THEME.background
  const colors = { ...DEFAULT_THEME.colors, ...theme.colors }

  const style: React.CSSProperties = {}

  if (!background) {
    style.backgroundColor = colors.background
    return style
  }

  switch (background.type) {
    case 'solid':
      style.backgroundColor = background.color || colors.background
      break

    case 'gradient':
      if (background.gradient) {
        style.backgroundImage = `linear-gradient(${background.gradient.direction}, ${background.gradient.from}, ${background.gradient.to})`
      }
      break

    case 'image':
      if (background.imageUrl) {
        style.backgroundImage = `url(${background.imageUrl})`
        style.backgroundSize = 'cover'
        style.backgroundPosition = 'center'
        style.backgroundRepeat = 'no-repeat'

        if (background.opacity !== undefined && background.opacity < 100) {
          style.opacity = background.opacity / 100
        }
      }
      break
  }

  return style
}

/**
 * Get fonts to load from theme
 */
export function getThemeFonts(theme: Partial<Theme>): string[] {
  const fonts = { ...DEFAULT_THEME.fonts, ...theme.fonts }

  const fontFamilies = [
    fonts.questionFamily,
    fonts.answerFamily,
    fonts.buttonFamily,
  ]

  // Remove duplicates
  return Array.from(new Set(fontFamilies))
}

/**
 * Generate Google Fonts link element for theme
 */
export function generateThemeFontsLink(theme: Partial<Theme>): string {
  const fonts = getThemeFonts(theme)
  const url = getGoogleFontsUrl(fonts)

  if (!url) return ''

  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${url}" rel="stylesheet">`
}

/**
 * Apply theme to document (client-side only)
 */
export function applyThemeToDocument(theme: Partial<Theme>): void {
  if (typeof document === 'undefined') return

  // Apply CSS variables
  const variables = generateThemeCSSVariables(theme)
  const root = document.documentElement

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Load fonts
  const fonts = getThemeFonts(theme)
  const url = getGoogleFontsUrl(fonts)

  if (url) {
    // Check if link already exists
    const existingLink = document.querySelector(`link[href="${url}"]`)
    if (!existingLink) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      document.head.appendChild(link)
    }
  }
}

/**
 * Get theme-aware styles for form elements
 */
export function getThemeStyles(theme: Partial<Theme>) {
  const colors = { ...DEFAULT_THEME.colors, ...theme.colors }
  const fonts = { ...DEFAULT_THEME.fonts, ...theme.fonts }
  const layout = { ...DEFAULT_THEME.layout, ...theme.layout }

  return {
    container: {
      maxWidth: layout?.containerWidth === 'narrow' ? '480px'
        : layout?.containerWidth === 'wide' ? '800px'
        : layout?.containerWidth === 'full' ? '100%'
        : '640px',
      margin: '0 auto',
      padding: layout?.spacing === 'compact' ? '16px'
        : layout?.spacing === 'relaxed' ? '48px'
        : '32px',
      textAlign: layout?.alignment || 'center',
    } as React.CSSProperties,

    question: {
      fontFamily: getFontFamilyValue(fonts.questionFamily),
      fontSize: fonts.questionSize,
      fontWeight: fonts.questionWeight,
      color: colors.text,
    } as React.CSSProperties,

    description: {
      fontFamily: getFontFamilyValue(fonts.answerFamily),
      fontSize: fonts.answerSize,
      fontWeight: fonts.answerWeight,
      color: colors.secondaryText,
    } as React.CSSProperties,

    input: {
      fontFamily: getFontFamilyValue(fonts.answerFamily),
      fontSize: fonts.answerSize,
      fontWeight: fonts.answerWeight,
      color: colors.text,
      borderColor: colors.primary,
    } as React.CSSProperties,

    button: {
      fontFamily: getFontFamilyValue(fonts.buttonFamily),
      fontSize: fonts.buttonSize,
      fontWeight: fonts.buttonWeight,
      backgroundColor: colors.primary,
      color: colors.primaryText,
      borderRadius: layout?.buttonShape === 'pill' ? '9999px'
        : layout?.buttonShape === 'square' ? '0'
        : '8px',
      padding: layout?.buttonSize === 'small' ? '8px 16px'
        : layout?.buttonSize === 'large' ? '16px 32px'
        : '12px 24px',
    } as React.CSSProperties,

    error: {
      color: colors.error,
    } as React.CSSProperties,

    success: {
      color: colors.success,
    } as React.CSSProperties,
  }
}

/**
 * Merge theme with defaults
 */
export function mergeWithDefaults(theme: Partial<Theme> | null | undefined): Theme {
  if (!theme) return DEFAULT_THEME

  const mergedLayout: ThemeLayout = {
    alignment: theme.layout?.alignment || DEFAULT_THEME.layout!.alignment,
    containerWidth: theme.layout?.containerWidth || DEFAULT_THEME.layout!.containerWidth,
    spacing: theme.layout?.spacing || DEFAULT_THEME.layout!.spacing,
    buttonShape: theme.layout?.buttonShape || DEFAULT_THEME.layout!.buttonShape,
    buttonSize: theme.layout?.buttonSize || DEFAULT_THEME.layout!.buttonSize,
  }

  return {
    id: theme.id || DEFAULT_THEME.id,
    name: theme.name || DEFAULT_THEME.name,
    colors: { ...DEFAULT_THEME.colors, ...theme.colors },
    fonts: { ...DEFAULT_THEME.fonts, ...theme.fonts },
    background: theme.background || DEFAULT_THEME.background,
    layout: mergedLayout,
    backgroundImage: theme.backgroundImage,
  }
}
