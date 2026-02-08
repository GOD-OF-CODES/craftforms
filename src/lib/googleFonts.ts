/**
 * Google Fonts integration
 */

export interface GoogleFont {
  family: string
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace'
  variants: string[]
}

// Popular fonts curated for form design
export const GOOGLE_FONTS: GoogleFont[] = [
  { family: 'Inter', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Roboto', category: 'sans-serif', variants: ['400', '500', '700'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['400', '600', '700'] },
  { family: 'Lato', category: 'sans-serif', variants: ['400', '700'] },
  { family: 'Montserrat', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Poppins', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Source Sans Pro', category: 'sans-serif', variants: ['400', '600', '700'] },
  { family: 'Nunito', category: 'sans-serif', variants: ['400', '600', '700'] },
  { family: 'Raleway', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Work Sans', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700'] },
  { family: 'Merriweather', category: 'serif', variants: ['400', '700'] },
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'] },
  { family: 'PT Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'] },
  { family: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'] },
  { family: 'Oswald', category: 'display', variants: ['400', '500', '600', '700'] },
  { family: 'Bebas Neue', category: 'display', variants: ['400'] },
  { family: 'Abril Fatface', category: 'display', variants: ['400'] },
  { family: 'Pacifico', category: 'handwriting', variants: ['400'] },
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'] },
  { family: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'] },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['400', '500', '600', '700'] },
  { family: 'Fira Code', category: 'monospace', variants: ['400', '500', '600', '700'] },
  { family: 'Source Code Pro', category: 'monospace', variants: ['400', '500', '600', '700'] },
]

/**
 * Get font by family name
 */
export function getFontByFamily(family: string): GoogleFont | undefined {
  return GOOGLE_FONTS.find(f => f.family === family)
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: GoogleFont['category']): GoogleFont[] {
  return GOOGLE_FONTS.filter(f => f.category === category)
}

/**
 * Generate Google Fonts URL for loading fonts
 */
export function getGoogleFontsUrl(fonts: string[]): string {
  if (fonts.length === 0) return ''

  const fontParams = fonts.map(family => {
    const font = getFontByFamily(family)
    if (!font) return null

    const encodedFamily = family.replace(/ /g, '+')
    const weights = font.variants.join(';')
    return `family=${encodedFamily}:wght@${weights}`
  }).filter(Boolean)

  if (fontParams.length === 0) return ''

  return `https://fonts.googleapis.com/css2?${fontParams.join('&')}&display=swap`
}

/**
 * Generate link element for loading fonts
 */
export function generateFontLinkElement(fonts: string[]): string {
  const url = getGoogleFontsUrl(fonts)
  if (!url) return ''
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${url}" rel="stylesheet">`
}

/**
 * Get CSS font-family value with fallbacks
 */
export function getFontFamilyValue(family: string): string {
  const font = getFontByFamily(family)
  if (!font) return 'system-ui, sans-serif'

  const fallbacks: Record<GoogleFont['category'], string> = {
    'serif': 'Georgia, serif',
    'sans-serif': 'system-ui, sans-serif',
    'display': 'system-ui, sans-serif',
    'handwriting': 'cursive',
    'monospace': 'monospace',
  }

  return `"${family}", ${fallbacks[font.category]}`
}

// Default theme fonts
export const DEFAULT_FONTS = {
  question: 'Inter',
  answer: 'Inter',
  button: 'Inter',
}

// Font size presets
export const FONT_SIZE_PRESETS = {
  small: {
    questionSize: '18px',
    answerSize: '16px',
    buttonSize: '14px',
  },
  medium: {
    questionSize: '24px',
    answerSize: '18px',
    buttonSize: '16px',
  },
  large: {
    questionSize: '32px',
    answerSize: '20px',
    buttonSize: '18px',
  },
}
