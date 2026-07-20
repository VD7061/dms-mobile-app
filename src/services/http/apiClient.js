import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useSessionStore } from '@/store/sessionStore';

const apiBaseUrl =
  Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = details.status ?? null;
    this.body = details.body ?? null;
  }
}

function getUrl(path) {
  if (!apiBaseUrl) {
    throw new ApiError('Missing API base URL. Set EXPO_PUBLIC_API_BASE_URL.');
  }

  return `${apiBaseUrl}${path}`;
}

function buildHeaders({ auth, json, showroom, headers }) {
  const session = useSessionStore.getState();
  const nextHeaders = {
    'X-Platform': Platform.OS,
    'X-Device-Id': session.deviceId,
    ...headers,
  };

  if (json) {
    nextHeaders['Content-Type'] = 'application/json';
  }

  if (auth && session.accessToken) {
    nextHeaders.Authorization = `${session.tokenType} ${session.accessToken}`;
  }

  if (showroom && session.activeShowroomId) {
    nextHeaders['X-Showroom-Id'] = String(session.activeShowroomId);
  }

  return nextHeaders;
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshSessionToken() {
  const session = useSessionStore.getState();

  if (!session.refreshToken) {
    return false;
  }

  const response = await fetch(getUrl('/api/v1/auth/refresh-token'), {
    method: 'POST',
    headers: buildHeaders({ auth: false, json: true, showroom: false, headers: {} }),
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  const body = await parseResponse(response);

  if (!response.ok || !body?.success) {
    session.logoutLocal();
    return false;
  }

  session.setTokens({
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    expiresIn: body.data.expiresIn,
    tokenType: body.data.tokenType,
  });

  return true;
}

export async function apiRequest(path, options = {}) {
  const {
    auth = true,
    body,
    headers = {},
    json = true,
    method = 'GET',
    retry = true,
    showroom = true,
  } = options;

  const response = await fetch(getUrl(path), {
    method,
    headers: buildHeaders({ auth, json, showroom, headers }),
    body: body === undefined ? undefined : json ? JSON.stringify(body) : body,
  });
  const responseBody = await parseResponse(response);

  if (response.status === 401 && auth && retry && (await refreshSessionToken())) {
    return apiRequest(path, { ...options, retry: false });
  }

  if (!response.ok || responseBody?.success === false) {
    throw new ApiError(responseBody?.message ?? 'API request failed', {
      status: response.status,
      body: responseBody,
    });
  }

  return responseBody;
}
