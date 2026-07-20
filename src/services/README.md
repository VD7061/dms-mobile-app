# Services

This folder is the app service layer.

This contains API endpoint documentation and real API methods. Every method
should use the shared HTTP client.

Runtime files are JavaScript (`.js`). Type declarations live in one dedicated
`types` subfolder so TypeScript screens still get autocomplete and contract
types without mixing `.d.ts` files into the API folders.

Set the backend base URL with:

```text
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

## Folder Guide

- `auth`: authentication APIs such as login, register, logout, refresh token.
- `auth/logout`: everything for the logout API.
- `auth/send-otp`: everything for the send OTP API.
- `auth/register`: everything for the register API.
- `auth/verify-otp`: everything for the verify OTP API.
- `auth/refresh-token`: everything for the refresh token API.
- `http`: shared API client used by every service method.
- `users`: user APIs such as profile, settings, preferences.
- `users/profile`: everything for profile APIs.
- `showrooms`: showroom setup, update, and member APIs.
- `types`: TypeScript declaration files for endpoint documentation shapes.
- `index.js`: main service export used by the app.

## Usage

```ts
import {
  getProfile,
  createShowroom,
  getProfileApi,
  loginApi,
  logoutApi,
  refreshTokenApi,
  registerApi,
  sendOtpApi,
  updateProfileApi,
  verifyOtpApi,
} from '@/services';

console.log(loginApi.path); // /api/v1/auth/login
console.log(logoutApi.path); // /api/v1/auth/logout
console.log(sendOtpApi.path); // /api/v1/auth/send-otp
console.log(registerApi.path); // /api/v1/auth/register
console.log(verifyOtpApi.path); // /api/v1/auth/verify-otp
console.log(refreshTokenApi.path); // /api/v1/auth/refresh-token
console.log(getProfileApi.path); // /api/v1/user/me
console.log(updateProfileApi.method); // PATCH

await getProfile(); // real API call through the shared client
await createShowroom({ name: 'My Showroom' }); // multipart showroom create
```

## API Call Rule

Every real API call should go through `services/http/apiClient.js`.

The client automatically adds:

- `Authorization`
- `X-Platform`
- `X-Device-Id`
- `X-Showroom-Id` when an active showroom exists

Feature folders stay small:

```text
auth/login/
  login.api.js      endpoint docs and examples
  login.service.js  real API method
  index.js          direct exports
```

Showroom files follow the same pattern:

```text
showrooms/create-showroom/
showrooms/update-showroom/
showrooms/members/add-member/
showrooms/members/list-members/
showrooms/members/remove-member/
showrooms/members/update-member-role/
```

## Adding A New Service

Use one folder pattern for every backend resource and every API feature.

Example: adding login under auth.

```text
src/services/auth/login/
  index.js
  login.api.js
```

In `login.api.js`, keep the full API contract:

```js
export const loginEndpoint = '/api/v1/auth/login';

export const loginApi = {
  name: 'Login',
  method: 'POST',
  path: loginEndpoint,
  auth: 'public',
  description: 'Logs in the user.',
  headers: [],
  requestBodyExample: {},
  curlExample: 'curl ...',
  successResponseExample: {
    status: 200,
    body: {},
  },
};
```

In `auth/login/index.js`, export that API:

```js
export { loginApi, loginEndpoint } from './login.api';
```

In `auth/index.js`, export the login folder:

```js
export * from './login';
```

Then it can be used anywhere:

```ts
import { loginApi } from '@/services';
```

## Adding Another Domain

Example: adding showroom APIs.

```text
src/services/showrooms/list/
  index.js
  list-showrooms.api.js
```

Then export the domain from `src/services/index.js`:

```js
export * from './showrooms';
```

Keep API files self-contained. Do not import a shared endpoint file just to
build the path. Write the backend path directly in the API file so it is easy to
read.

Keep API methods separate later. API contract files should not call `fetch`,
Axios, or any network client.
