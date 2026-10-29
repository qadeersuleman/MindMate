export const setNotificationHandler = () => {};

export const scheduleNotificationAsync = async (content = {}) => {
  return 'notif-id-1';
};

export const cancelAllScheduledNotificationsAsync = async () => {};

export const requestPermissionsAsync = async () => ({
  status: 'granted',
  granted: true,
});

export const getPermissionsAsync = async () => ({
  status: 'granted',
  granted: true,
});

export const addNotificationResponseReceivedListener = () => ({
  remove: () => {},
});

export const addNotificationReceivedListener = () => ({
  remove: () => {},
});

export default {
  setNotificationHandler,
  scheduleNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  requestPermissionsAsync,
  getPermissionsAsync,
  addNotificationResponseReceivedListener,
  addNotificationReceivedListener,
};

