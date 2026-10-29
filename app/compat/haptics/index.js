import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const NotificationFeedbackType = {
  Success: 'notificationSuccess',
  Warning: 'notificationWarning',
  Error: 'notificationError',
};

export const ImpactFeedbackStyle = {
  Light: 'impactLight',
  Medium: 'impactMedium',
  Heavy: 'impactHeavy',
};

export const notificationAsync = async (type = NotificationFeedbackType.Success) => {
  try {
    ReactNativeHapticFeedback.trigger(type, options);
  } catch (e) {
    // ignore
  }
};

export const impactAsync = async (style = ImpactFeedbackStyle.Medium) => {
  try {
    ReactNativeHapticFeedback.trigger(style, options);
  } catch (e) {
    // ignore
  }
};

export const selectionAsync = async () => {
  try {
    ReactNativeHapticFeedback.trigger('selection', options);
  } catch (e) {
    // ignore
  }
};

export default {
  NotificationFeedbackType,
  ImpactFeedbackStyle,
  notificationAsync,
  impactAsync,
  selectionAsync,
};

