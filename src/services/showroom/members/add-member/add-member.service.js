import { api } from '../../../http';
import { addMemberEndpoint } from './add-member.api';

export function addMember({ showroomId, userId, role }) {
  const endpoint = addMemberEndpoint.replace(':id', String(showroomId));

  return api.post(endpoint, { user_id: userId, role });
}
