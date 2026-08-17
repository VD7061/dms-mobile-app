import { api } from '../../http';
import { getDashboardEndpoint } from './get-dashboard.api';

export function getDashboard({ duration = 'lifetime', showroomId } = {}) {
  return api.get(getDashboardEndpoint, {
    params: {
      duration,
      showroom_id: showroomId,
    },
  });
}
