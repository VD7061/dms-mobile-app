export function getUpdateShowroomMemberRoleEndpoint(showroomId, userId) {
  return `/api/v1/showroom/${showroomId}/member/${userId}`;
}

export const updateShowroomMemberRoleApi = {
  name: 'Update Member Role',
  method: 'PATCH',
  path: '/api/v1/showroom/:id/member/:user_id',
  auth: 'protected',
  description: 'Updates a showroom member role. Caller must be owner.',
  headers: [
    { name: 'Authorization', example: 'Bearer {{access_token}}', required: true, description: 'Bearer access token.' },
    { name: 'X-Platform', example: 'web', required: true, description: 'Platform making the request.' },
    { name: 'X-Device-Id', example: 'browser-1', required: true, description: 'Current device id.' },
    { name: 'Content-Type', example: 'application/json', required: true, description: 'JSON request body.' },
  ],
  requestBodyExample: { role: 'manager' },
  curlExample: `curl --location -g --request PATCH '{{base_url}}/api/v1/showroom/1/member/42' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1' \\
--header 'Content-Type: application/json' \\
--data '{"role":"manager"}'`,
  successResponseExample: {
    status: 200,
    body: { success: true, message: 'member role updated', data: null },
  },
};
