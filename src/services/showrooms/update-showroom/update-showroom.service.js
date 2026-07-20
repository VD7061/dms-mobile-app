import { apiRequest } from '../../http';
import { buildShowroomFormData } from '../formData';
import { getUpdateShowroomEndpoint } from './update-showroom.api';

export function updateShowroom(showroomId, payload) {
  return apiRequest(getUpdateShowroomEndpoint(showroomId), {
    body: buildShowroomFormData(payload),
    json: false,
    method: 'PATCH',
    showroom: false,
  });
}
