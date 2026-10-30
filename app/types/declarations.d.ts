declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.mp4' {
  const value: any;
  export default value;
}

// Expo compatibility shims declarations
declare module '@expo/vector-icons' {
  export const Ionicons: any;
  export const MaterialIcons: any;
  export const MaterialCommunityIcons: any;
  export const Feather: any;
  export const FontAwesome: any;
  export const FontAwesome5: any;
  export const AntDesign: any;
  export const Entypo: any;
  export const EvilIcons: any;
  export const Foundation: any;
  export const Octicons: any;
  export const SimpleLineIcons: any;
  export const Zocial: any;
  const defaultExport: any;
  export default defaultExport;
}

declare module 'expo-linear-gradient' {
  import React from 'react';
  import { ViewProps } from 'react-native';
  export interface LinearGradientProps extends ViewProps {
    colors: readonly (string | number)[] | (string | number)[];
    start?: { x: number; y: number } | [number, number];
    end?: { x: number; y: number } | [number, number];
    locations?: number[];
  }
  export const LinearGradient: React.FC<LinearGradientProps>;
  export default LinearGradient;
}

declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 'light',
    Medium = 'medium',
    Heavy = 'heavy',
  }
  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
  }
  export const impactAsync: (style?: ImpactFeedbackStyle) => Promise<void>;
  export const notificationAsync: (type?: NotificationFeedbackType) => Promise<void>;
  export const selectionAsync: () => Promise<void>;
}

declare module 'expo-constants' {
  const Constants: {
    statusBarHeight: number;
    [key: string]: any;
  };
  export default Constants;
}

declare module 'expo-blur' {
  import React from 'react';
  import { ViewProps } from 'react-native';
  export interface BlurViewProps extends ViewProps {
    intensity?: number;
    tint?: 'default' | 'light' | 'dark';
  }
  export const BlurView: React.FC<BlurViewProps>;
}

declare module 'expo-font' {
  export const loadAsync: (map: Record<string, any>) => Promise<void>;
  export const isLoaded: (name: string) => boolean;
  export const useFonts: (map: Record<string, any>) => [boolean, Error | null];
}

declare module 'expo-camera' {
  export const Camera: any;
  export const CameraView: any;
  export const useCameraPermissions: any;
}

declare module 'expo-av' {
  export const Audio: any;
  export const Video: any;
  export const ResizeMode: any;
}

declare module 'expo-file-system' {
  export const documentDirectory: string;
  export const cacheDirectory: string;
  export const readDirectoryAsync: (uri: string) => Promise<string[]>;
  export const getInfoAsync: (uri: string, options?: any) => Promise<any>;
  export const makeDirectoryAsync: (uri: string, options?: any) => Promise<any>;
  export const moveAsync: (options: any) => Promise<void>;
  export const copyAsync: (options: any) => Promise<void>;
  export const deleteAsync: (uri: string) => Promise<void>;
}

declare module 'expo-image-picker' {
  export const MediaTypeOptions: any;
  export const launchImageLibraryAsync: (options?: any) => Promise<any>;
  export const launchCameraAsync: (options?: any) => Promise<any>;
  export const requestMediaLibraryPermissionsAsync: () => Promise<any>;
  export const requestCameraPermissionsAsync: () => Promise<any>;
}

declare module 'expo-notifications' {
  export const setNotificationHandler: (handler: any) => void;
  export const scheduleNotificationAsync: (request: any) => Promise<string>;
  export const cancelAllScheduledNotificationsAsync: () => Promise<void>;
  export const getAllScheduledNotificationsAsync: () => Promise<any[]>;
  export const getPermissionsAsync: () => Promise<any>;
  export const requestPermissionsAsync: () => Promise<any>;
}

declare module '@expo-google-fonts/poppins' {
  export const Poppins_700Bold: any;
  export const Poppins_600SemiBold: any;
  export const Poppins_500Medium: any;
  export const Poppins_800ExtraBold: any;
  export const Poppins_400Regular: any;
  export const useFonts: any;
}

declare module '@expo-google-fonts/inter' {
  export const Inter_400Regular: any;
  export const Inter_500Medium: any;
  export const Inter_600SemiBold: any;
  export const Inter_700Bold: any;
  export const useFonts: any;
}

declare module '@expo-google-fonts/lora' {
  export const Lora_400Regular_Italic: any;
  export const useFonts: any;
}

declare module '@expo-google-fonts/*' {
  const content: any;
  export default content;
}
