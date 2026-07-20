import { apiRequest } from '../../../http';
import { getRemoveShowroomMemberEndpoint } from './remove-member.api';

export function removeShowroomMember(showroomId, userId) {
  return apiRequest(getRemoveShowroomMemberEndpoint(showroomId, userId), {
    method: 'DELETE',
    showroom: false,
  });
}
