import { apiRequest } from '../../http';
import { loginEndpoint } from './login.api';

export function login(payload) {
  return apiRequest(loginEndpoint, {
    auth: false,
    body: payload,
    method: 'POST',
    showroom: false,
  });
}
