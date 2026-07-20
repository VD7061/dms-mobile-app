import { apiRequest } from '../../http';
import { buildShowroomFormData } from '../formData';
import { createShowroomEndpoint } from './create-showroom.api';

export function createShowroom(payload) {
  return apiRequest(createShowroomEndpoint, {
    body: buildShowroomFormData(payload),
    json: false,
    method: 'POST',
    showroom: false,
  });
}
