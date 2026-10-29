import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export const MediaTypeOptions = {
  All: 'mixed',
  Videos: 'video',
  Images: 'photo',
};

export const requestMediaLibraryPermissionsAsync = async () => ({
  status: 'granted',
  granted: true,
});

export const requestCameraPermissionsAsync = async () => ({
  status: 'granted',
  granted: true,
});

export const launchImageLibraryAsync = async (options = {}) => {
  const mediaType = options.mediaTypes === MediaTypeOptions.Videos ? 'video' : 'photo';
  const res = await launchImageLibrary({
    mediaType,
    quality: options.quality || 0.8,
    includeBase64: options.base64 || false,
  });

  if (res.didCancel || !res.assets || res.assets.length === 0) {
    return { canceled: true, assets: null };
  }

  return {
    canceled: false,
    assets: res.assets.map(a => ({
      uri: a.uri,
      width: a.width,
      height: a.height,
      type: a.type,
      fileName: a.fileName,
      fileSize: a.fileSize,
      base64: a.base64,
    })),
  };
};

export const launchCameraAsync = async (options = {}) => {
  const mediaType = options.mediaTypes === MediaTypeOptions.Videos ? 'video' : 'photo';
  const res = await launchCamera({
    mediaType,
    quality: options.quality || 0.8,
    includeBase64: options.base64 || false,
  });

  if (res.didCancel || !res.assets || res.assets.length === 0) {
    return { canceled: true, assets: null };
  }

  return {
    canceled: false,
    assets: res.assets.map(a => ({
      uri: a.uri,
      width: a.width,
      height: a.height,
      type: a.type,
      fileName: a.fileName,
      fileSize: a.fileSize,
      base64: a.base64,
    })),
  };
};

export default {
  MediaTypeOptions,
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
};

