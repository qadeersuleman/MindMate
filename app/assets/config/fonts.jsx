// theme/fonts.js
import { 
  Poppins_700Bold, 
  Poppins_600SemiBold, 
  Poppins_500Medium 
} from '@expo-google-fonts/poppins';
import { 
  Inter_400Regular, 
  Inter_300Light 
} from '@expo-google-fonts/inter';
import { 
  Lora_400Regular_Italic 
} from '@expo-google-fonts/lora';
import * as Font from 'expo-font';

// Font loading configuration
export const loadFonts = async () => {
  await Font.loadAsync({
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Medium': Poppins_500Medium,
    'Inter-Regular': Inter_400Regular,
    'Inter-Light': Inter_300Light,
    'Lora-Italic': Lora_400Regular_Italic,
  });
};

// Safe font style getter - SIMPLE VERSION
export const getFontStyle = (fontKey) => {
  const fontStyles = {
    // Headings
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

    // Body Text
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

    // Buttons
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

  return fontStyles[fontKey] || fontStyles.bodyMedium;
};

// Export individual font styles as well
export const Fonts = {
  heading1: getFontStyle('heading1'),
  heading2: getFontStyle('heading2'),
  heading3: getFontStyle('heading3'),
  bodyLarge: getFontStyle('bodyLarge'),
  bodyMedium: getFontStyle('bodyMedium'),
  bodySmall: getFontStyle('bodySmall'),
  buttonPrimary: getFontStyle('buttonPrimary'),
  buttonSecondary: getFontStyle('buttonSecondary'),
};

export default Fonts;