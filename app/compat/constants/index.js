import { StatusBar, Platform } from 'react-native';

const Constants = {
  statusBarHeight: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44,
  deviceName: Platform.OS,
  manifest: {},
  expoConfig: {},
};

export default Constants;

