import { apiRequest } from '../../../http';
import { getUpdateShowroomMemberRoleEndpoint } from './update-member-role.api';

export function updateShowroomMemberRole(showroomId, userId, payload) {
  return apiRequest(getUpdateShowroomMemberRoleEndpoint(showroomId, userId), {
    body: payload,
    method: 'PATCH',
    showroom: false,
  });
}
