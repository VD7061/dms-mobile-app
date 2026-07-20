export function getUpdateShowroomEndpoint(showroomId) {
  return `/api/v1/showroom/${showroomId}`;
}

export const updateShowroomApi = {
  name: 'Update Showroom',
  method: 'PATCH',
  path: '/api/v1/showroom/:id',
  auth: 'protected',
  description: 'Updates showroom details. Caller must be owner or manager.',
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
  requestBodyExample: {
    name: 'Updated Showroom Name',
    geolocation: {
      address: '456 New St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      lat: 19.076,
      lng: 72.8777,
    },
    removeLogo: true,
    removeBanner: true,
  },
  curlExample: `curl --location -g --request PATCH '{{base_url}}/api/v1/showroom/1' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1' \\
--form 'name="Updated Showroom Name"'`,
  successResponseExample: {
    status: 200,
    body: {
      success: true,
      message: 'showroom updated',
      data: {
        id: 1,
        name: 'Updated Showroom Name',
        showroom_logo: null,
        showroom_banner: '1/1/20240101120000.jpg',
        geolocation: {
          address: '456 New St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          lat: 19.076,
          lng: 72.8777,
        },
      },
    },
  },
};
