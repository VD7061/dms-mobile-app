import { httpClient } from '../../http';
import { loginEndpoint } from './login.api';

export function login({ countryCode, phoneNumber }) {
  return httpClient.post(loginEndpoint, { countryCode, phoneNumber }, { meta: { auth: false } });
}
