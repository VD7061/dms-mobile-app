import { apiRequest } from '../../http';
import { refreshTokenEndpoint } from './refresh-token.api';

export function refreshToken(payload) {
  return apiRequest(refreshTokenEndpoint, {
    auth: false,
    body: payload,
    method: 'POST',
    showroom: false,
  });
}
