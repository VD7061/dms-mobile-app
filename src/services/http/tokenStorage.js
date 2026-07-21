import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'dms.accessToken';
const REFRESH_TOKEN_KEY = 'dms.refreshToken';
const EXPIRES_IN_KEY = 'dms.expiresIn';
const TOKEN_TYPE_KEY = 'dms.tokenType';

export async function getTokens() {
  const [accessToken, refreshToken, expiresIn, tokenType] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(EXPIRES_IN_KEY),
    SecureStore.getItemAsync(TOKEN_TYPE_KEY),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: expiresIn ? Number(expiresIn) : null,
    tokenType: tokenType ?? 'Bearer',
  };
}

export async function setTokens({ accessToken, refreshToken, expiresIn, tokenType }) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    SecureStore.setItemAsync(EXPIRES_IN_KEY, String(expiresIn ?? '')),
    SecureStore.setItemAsync(TOKEN_TYPE_KEY, tokenType ?? 'Bearer'),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(EXPIRES_IN_KEY),
    SecureStore.deleteItemAsync(TOKEN_TYPE_KEY),
  ]);
}
