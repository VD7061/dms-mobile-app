import { apiRequest } from '../../../http';
import { getListShowroomMembersEndpoint } from './list-members.api';

export function listShowroomMembers(showroomId, params) {
  return apiRequest(getListShowroomMembersEndpoint(showroomId, params), {
    method: 'GET',
    showroom: false,
  });
}
