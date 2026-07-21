import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'dms.deviceId';

let cachedDeviceId = null;

function generateDeviceId() {
  const random = Math.random().toString(36).slice(2);
  return `device-${Date.now()}-${random}`;
}

export async function getDeviceId() {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }

  const deviceId = generateDeviceId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  cachedDeviceId = deviceId;

  return deviceId;
}
