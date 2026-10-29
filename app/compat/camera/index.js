import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, StyleSheet, Text, PermissionsAndroid, Platform } from 'react-native';

export const useCameraPermissions = () => {
  const [permission, setPermission] = useState({ granted: true, canAskAgain: true, status: 'granted' });

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setPermission({ granted: isGranted, canAskAgain: true, status: isGranted ? 'granted' : 'denied' });
        return { granted: isGranted, status: isGranted ? 'granted' : 'denied' };
      } catch (err) {
        return { granted: false, status: 'denied' };
      }
    }
    return { granted: true, status: 'granted' };
  };

  return [permission, requestPermission];
};

export const CameraView = forwardRef(({ style, facing = 'back', children, ...props }, ref) => {
  useImperativeHandle(ref, () => ({
    takePictureAsync: async (options = {}) => {
      // Mock photo response or snapshot
      return {
        uri: 'file:///mock/captured.jpg',
        width: 1080,
        height: 1920,
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };
    },
  }));

  return (
    <View style={[{ backgroundColor: '#000' }, style]} {...props}>
      {children}
    </View>
  );
});

export default {
  CameraView,
  useCameraPermissions,
};

