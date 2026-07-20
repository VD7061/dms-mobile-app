/**
 * Logout API.
 *
 * Keep everything for logout here:
 * endpoint path, required headers, request body example, curl example, and
 * success response example.
 *
 * No backend call is made from this file.
 */
export const logoutEndpoint = '/api/v1/auth/logout';

export const logoutApi = {
  name: 'Logout',
  method: 'POST',
  path: logoutEndpoint,
  auth: 'protected',
  description:
    'Revokes active sessions for the authenticated user only on the requested platform/device.',
  headers: [
    {
      name: 'Content-Type',
      example: 'application/json',
      required: true,
      description: 'Tells the backend we are sending JSON.',
    },
    {
      name: 'Authorization',
      example: 'Bearer {{access_token}}',
      required: true,
      description: 'Bearer access token for the logged-in user.',
    },
    {
      name: 'X-Platform',
      example: 'web',
      required: true,
      description: 'Platform where the session should be revoked.',
    },
    {
      name: 'X-Device-Id',
      example: 'browser-1',
      required: true,
      description: 'Device id for the active session.',
    },
  ],
  requestBodyExample: null,
  curlExample: `curl --location -g --request POST '{{base_url}}/api/v1/auth/logout' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1'`,
  successResponseExample: {
    status: 200,
    body: {
      success: true,
      message: 'Logged out successfully',
    },
  },
};
