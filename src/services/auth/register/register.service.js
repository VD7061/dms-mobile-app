import { apiRequest } from '../../http';
import { registerEndpoint } from './register.api';

export function register(payload) {
  return apiRequest(registerEndpoint, {
    auth: false,
    body: payload,
    method: 'POST',
    showroom: false,
  });
}
