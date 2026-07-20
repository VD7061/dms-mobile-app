export function getAddShowroomMemberEndpoint(showroomId) {
  return `/api/v1/showroom/${showroomId}/member`;
}

export const addShowroomMemberApi = {
  name: 'Add Showroom Member',
  method: 'POST',
  path: '/api/v1/showroom/:id/member',
  auth: 'protected',
  description:
    "Adds a member. Owner can assign manager or employee. Manager can assign employee.",
  headers: [
    { name: 'Authorization', example: 'Bearer {{access_token}}', required: true, description: 'Bearer access token.' },
    { name: 'X-Platform', example: 'web', required: true, description: 'Platform making the request.' },
    { name: 'X-Device-Id', example: 'browser-1', required: true, description: 'Current device id.' },
    { name: 'Content-Type', example: 'application/json', required: true, description: 'JSON request body.' },
  ],
  requestBodyExample: { user_id: 42, role: 'employee' },
  curlExample: `curl --location -g '{{base_url}}/api/v1/showroom/1/member' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1' \\
--header 'Content-Type: application/json' \\
--data '{"user_id":42,"role":"employee"}'`,
  successResponseExample: {
    status: 201,
    body: {
      success: true,
      message: 'member added',
      data: { showroom_id: 1, user_id: 42, role: 'employee' },
    },
  },
};
