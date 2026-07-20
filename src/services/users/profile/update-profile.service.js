import { apiRequest } from '../../http';
import { updateProfileEndpoint } from './update-profile.api';

export function updateProfile(payload) {
  return apiRequest(updateProfileEndpoint, {
    body: payload,
    method: 'PATCH',
    showroom: false,
  });
}
