/**
 * Get Profile API.
 *
 * Keep everything for fetching the authenticated user's profile here.
 *
 * No backend call is made from this file.
 */
export const getProfileEndpoint = '/api/v1/user/me';

export const getProfileApi = {
  name: 'Get Profile',
  method: 'GET',
  path: getProfileEndpoint,
  auth: 'protected',
  description:
    "Returns the authenticated user's profile including name, phone number, and all showroom-role pairs. Fields can be nullable.",
  headers: [
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
  requestBodyExample: null,
  curlExample: `curl --location -g '{{base_url}}/api/v1/user/me' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1'`,
  successResponseExample: {
    status: 200,
    body: {
      success: true,
      message: 'profile fetched',
      data: {
        name: 'John Doe',
        phone_number: '+919999999999',
        showroom_roles: [
          {
            showroom_id: 1,
            showroom_name: 'Showroom A',
            role: 'owner',
          },
          {
            showroom_id: 2,
            showroom_name: 'Showroom B',
            role: 'manager',
          },
        ],
      },
    },
  },
};
