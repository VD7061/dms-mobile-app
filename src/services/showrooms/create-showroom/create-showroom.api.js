export const createShowroomEndpoint = '/api/v1/showroom';

export const createShowroomApi = {
  name: 'Create Showroom',
  method: 'POST',
  path: createShowroomEndpoint,
  auth: 'protected',
  description: 'Creates a showroom and assigns the authenticated user as owner.',
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
    name: 'My Showroom',
    geolocation: {
      address: '123 Main St',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      lat: 12.9716,
      lng: 77.5946,
    },
    showroomLogo: null,
    showroomBanner: null,
  },
  curlExample: `curl --location -g '{{base_url}}/api/v1/showroom' \\
--header 'Authorization: Bearer {{access_token}}' \\
--header 'X-Platform: web' \\
--header 'X-Device-Id: browser-1' \\
--form 'name="My Showroom"' \\
--form 'geolocation="{\\"address\\":\\"123 Main St\\",\\"city\\":\\"Bengaluru\\",\\"state\\":\\"Karnataka\\",\\"pincode\\":\\"560001\\",\\"lat\\":12.9716,\\"lng\\":77.5946}"'`,
  successResponseExample: {
    status: 201,
    body: {
      success: true,
      message: 'showroom created',
      data: {
        id: 1,
        name: 'My Showroom',
        showroom_logo: '1/1/20240101120000.jpg',
        showroom_banner: null,
        geolocation: {
          address: '123 Main St',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          lat: 12.9716,
          lng: 77.5946,
        },
      },
    },
  },
};
