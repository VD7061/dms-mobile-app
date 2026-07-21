import { httpClient } from '../../http';
import { updateProfileEndpoint } from './update-profile.api';

export function updateProfile({ name }) {
  return httpClient.patch(updateProfileEndpoint, { name });
}
