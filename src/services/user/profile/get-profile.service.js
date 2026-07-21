import { httpClient } from '../../http';
import { getProfileEndpoint } from './get-profile.api';

export function getProfile() {
  return httpClient.get(getProfileEndpoint);
}
