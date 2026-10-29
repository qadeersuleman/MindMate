const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native-metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      '@expo/vector-icons': path.resolve(__dirname, 'app/compat/vector-icons'),
      'expo-linear-gradient': path.resolve(__dirname, 'app/compat/linear-gradient'),
      'expo-status-bar': path.resolve(__dirname, 'app/compat/status-bar'),
      'expo-haptics': path.resolve(__dirname, 'app/compat/haptics'),
      'expo-constants': path.resolve(__dirname, 'app/compat/constants'),
      'expo-blur': path.resolve(__dirname, 'app/compat/blur'),
      'expo-font': path.resolve(__dirname, 'app/compat/font'),
      '@expo-google-fonts/poppins': path.resolve(__dirname, 'app/compat/google-fonts/poppins'),
      '@expo-google-fonts/inter': path.resolve(__dirname, 'app/compat/google-fonts/inter'),
      '@expo-google-fonts/lora': path.resolve(__dirname, 'app/compat/google-fonts/lora'),
      'expo-file-system': path.resolve(__dirname, 'app/compat/file-system'),
      'expo-image-picker': path.resolve(__dirname, 'app/compat/image-picker'),
      'expo-camera': path.resolve(__dirname, 'app/compat/camera'),
      'expo-av': path.resolve(__dirname, 'app/compat/av'),
      'expo-notifications': path.resolve(__dirname, 'app/compat/notifications'),
      'expo-face-detector': path.resolve(__dirname, 'app/compat/face-detector'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
