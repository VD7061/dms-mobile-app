export function getListShowroomMembersEndpoint(showroomId, params = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return `/api/v1/showroom/${showroomId}/member?page=${page}&limit=${limit}`;
}

export const listShowroomMembersApi = {
  name: 'List Showroom Members',
  method: 'GET',
  path: '/api/v1/showroom/:id/member?page=1&limit=20',
  auth: 'protected',
  description: 'Lists paginated showroom members. Caller must be owner or manager.',
  headers: [
    { name: 'Authorization', example: 'Bearer {{access_token}}', required: true, description: 'Bearer access token.' },
    { name: 'X-Platform', example: 'web', required: true, description: 'Platform making the request.' },
    { name: 'X-Device-Id', example: 'browser-1', required: true, description: 'Current device id.' },
  ],
  requestBodyExample: null,
  curlExample: `curl --location -g '{{base_url}}/api/v1/showroom/1/member?page=1&limit=20' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1'`,
  successResponseExample: {
    status: 200,
    body: {
      success: true,
      message: 'members retrieved',
      data: {
        members: [
          { user_id: 42, name: 'John Doe', phone_number: '+91-9876543210', role: 'employee' },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    },
  },
};
