export function getRemoveShowroomMemberEndpoint(showroomId, userId) {
  return `/api/v1/showroom/${showroomId}/member/${userId}`;
}

export const removeShowroomMemberApi = {
  name: 'Remove Showroom Member',
  method: 'DELETE',
  path: '/api/v1/showroom/:id/member/:user_id',
  auth: 'protected',
  description: 'Removes a showroom member. Owner, manager, or the member themselves can remove.',
  headers: [
    { name: 'Authorization', example: 'Bearer {{access_token}}', required: true, description: 'Bearer access token.' },
    { name: 'X-Platform', example: 'web', required: true, description: 'Platform making the request.' },
    { name: 'X-Device-Id', example: 'browser-1', required: true, description: 'Current device id.' },
  ],
  requestBodyExample: null,
  curlExample: `curl --location -g --request DELETE '{{base_url}}/api/v1/showroom/1/member/42' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1'`,
  successResponseExample: {
    status: 200,
    body: { success: true, message: 'member removed', data: null },
  },
};
