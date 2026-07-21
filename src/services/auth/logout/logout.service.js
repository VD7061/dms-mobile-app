import { httpClient } from '../../http';
import { logoutEndpoint } from './logout.api';

export function logout() {
  return httpClient.post(logoutEndpoint);
}
