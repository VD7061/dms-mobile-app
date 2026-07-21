import axios from 'axios';
import Constants from 'expo-constants';
import { getApiPlatform, getDeviceId } from './deviceId';
import { clearTokens, getTokens, setTokens } from './tokenStorage';

const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || '';
const apiPlatform = getApiPlatform();

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = details.status ?? null;
    this.body = details.body ?? null;
  }
}

function getErrorMessage(body, status) {
  if (body?.error?.message) {
    return body.error.message;
  }

  if (body?.message) {
    return body.message;
  }

  return `API request failed (${status ?? 'network error'})`;
}

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-Platform': apiPlatform,
  },
});

httpClient.interceptors.request.use(async (config) => {
  if (!apiBaseUrl) {
    throw new ApiError('Missing API base URL. Set EXPO_PUBLIC_API_BASE_URL in .env.');
  }

  config.headers['X-Device-Id'] = await getDeviceId();

  const requiresAuth = config.meta?.auth !== false;

  if (requiresAuth) {
    const tokens = await getTokens();

    if (tokens) {
      config.headers.Authorization = `${tokens.tokenType} ${tokens.accessToken}`;
    }
  }

  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const tokens = await getTokens();

  if (!tokens?.refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${apiBaseUrl}/api/v1/auth/refresh-token`,
      { refreshToken: tokens.refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': apiPlatform,
          'X-Device-Id': await getDeviceId(),
        },
      }
    );

    const nextTokens = response.data?.data;
    await setTokens(nextTokens);

    return nextTokens;
  } catch {
    await clearTokens();
    return null;
  }
}

httpClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error;
    const requiresAuth = config?.meta?.auth !== false;

    if (response?.status === 401 && requiresAuth && !config._retry) {
      config._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const nextTokens = await refreshPromise;
      refreshPromise = null;

      if (nextTokens) {
        config.headers.Authorization = `${nextTokens.tokenType} ${nextTokens.accessToken}`;
        return httpClient(config);
      }
    }

    throw new ApiError(getErrorMessage(response?.data, response?.status), {
      status: response?.status ?? null,
      body: response?.data ?? null,
    });
  }
);
