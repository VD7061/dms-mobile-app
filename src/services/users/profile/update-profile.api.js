/**
 * Update Profile API.
 *
 * Keep everything for updating the authenticated user's profile name here.
 *
 * No backend call is made from this file.
 */
export const updateProfileEndpoint = '/api/v1/user/me';

export const updateProfileApi = {
  name: 'Update Profile',
  method: 'PATCH',
  path: updateProfileEndpoint,
  auth: 'protected',
  description:
    "Updates the authenticated user's profile name. Name must be non-empty after trim and contain only letters, spaces, hyphens, and apostrophes.",
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
      description: 'Platform making the request.',
    },
    {
      name: 'X-Device-Id',
      example: 'browser-1',
      required: true,
      description: 'Unique id for the current device/session.',
    },
  ],
  requestBodyExample: {
    name: 'John Doe',
  },
  curlExample: `curl --location -g --request PATCH '{{base_url}}/api/v1/user/me' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1' \\
--data '{
  "name": "John Doe"
}'`,
  successResponseExample: {
    status: 200,
    body: {
      success: true,
      message: 'profile updated',
      data: {
        name: 'John Doe',
      },
    },
  },
};
