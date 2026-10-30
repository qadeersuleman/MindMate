// app/config/fonts.ts
import { TextStyle } from 'react-native';

export type FontStyleKey =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'buttonPrimary'
  | 'buttonSecondary';

const fontStyles: Record<FontStyleKey, TextStyle> = {
  heading1: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  heading2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: '#2E3A59',
  },
  heading3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#2E3A59',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'normal',
    color: '#4A5568',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'normal',
    color: '#4A5568',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '300',
    color: '#4A5568',
  },
  buttonPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.5,
  },
  buttonSecondary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
  },
};

export const getFontStyle = (fontKey: FontStyleKey | string): TextStyle => {
  return fontStyles[fontKey as FontStyleKey] || fontStyles.bodyMedium;
};

export const Fonts = fontStyles;
export default Fonts;

