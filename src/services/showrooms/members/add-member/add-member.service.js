import { apiRequest } from '../../../http';
import { getAddShowroomMemberEndpoint } from './add-member.api';

export function addShowroomMember(showroomId, payload) {
  return apiRequest(getAddShowroomMemberEndpoint(showroomId), {
    body: payload,
    method: 'POST',
    showroom: false,
  });
}
