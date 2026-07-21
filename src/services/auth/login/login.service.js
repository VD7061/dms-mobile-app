import { api } from '../../http';
import { loginEndpoint } from './login.api';

export function login({ countryCode, phoneNumber }) {
  return api.post(loginEndpoint, { countryCode, phoneNumber }, { auth: false });
}
