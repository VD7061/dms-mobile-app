import { apiRequest } from '../../http';
import { logoutEndpoint } from './logout.api';

export function logout() {
  return apiRequest(logoutEndpoint, {
    method: 'POST',
    showroom: false,
  });
}
