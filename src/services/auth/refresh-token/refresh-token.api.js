/**
 * Refresh Token API.
 *
 * Keep everything for refresh token rotation here:
 * endpoint path, required headers, request body example, curl example, and
 * success response example.
 *
 * No backend call is made from this file.
 */
export const refreshTokenEndpoint = '/api/v1/auth/refresh-token';

export const refreshTokenApi = {
  name: 'Refresh Token',
  method: 'POST',
  path: refreshTokenEndpoint,
  auth: 'public',
  description: 'Rotates token pair using a refresh token.',
  headers: [
    {
      name: 'Content-Type',
      example: 'application/json',
      required: true,
      description: 'Tells the backend we are sending JSON.',
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
    refreshToken: '...',
  },
  curlExample: `curl --location -g '{{base_url}}/api/v1/auth/refresh-token' \\
--header 'Content-Type: application/json' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1' \\
--data '{
  "refreshToken": "..."
}'`,
  successResponseExample: {
    status: 200,
    body: {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: '...',
        refreshToken: '...',
        expiresIn: 3600,
        tokenType: 'Bearer',
      },
    },
  },
};
