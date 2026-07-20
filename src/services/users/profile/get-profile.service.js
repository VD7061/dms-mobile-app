import { apiRequest } from '../../http';
import { getProfileEndpoint } from './get-profile.api';

export function getProfile() {
  return apiRequest(getProfileEndpoint, {
    method: 'GET',
    showroom: false,
  });
}
