import { httpClient } from '../../http';
import { registerEndpoint } from './register.api';

export function register({ countryCode, phoneNumber }) {
  return httpClient.post(registerEndpoint, { countryCode, phoneNumber }, { meta: { auth: false } });
}
