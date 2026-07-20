/**
 * Central service type declarations.
 *
 * Runtime service files stay in JavaScript under `src/services`.
 * These declarations live in one folder so API folders remain easy to scan.
 */
export type ApiHttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ApiAuthType = 'public' | 'protected';

export interface ApiHeaderDocumentation {
  /**
   * Header key sent to the backend.
   * Example: `Authorization`
   */
  name: string;

  /**
   * Example value we expect to send.
   * Example: `Bearer {{access_token}}`
   */
  example: string;

  /**
   * Whether this header is required by the backend.
   */
  required: boolean;

  /**
   * Small human note explaining why this header exists.
   */
  description: string;
}

export interface ApiEndpointDocumentation<RequestBody = unknown, SuccessResponse = unknown> {
  /**
   * Simple name for humans when scanning the file.
   */
  name: string;

  /**
   * HTTP method used by the backend route.
   */
  method: ApiHttpMethod;

  /**
   * Backend path without `base_url`.
   */
  path: `/${string}`;

  /**
   * Whether the API needs an authenticated user.
   */
  auth: ApiAuthType;

  /**
   * Short explanation of what the endpoint does.
   */
  description: string;

  /**
   * Headers that must be sent when this API is called later.
   */
  headers: readonly ApiHeaderDocumentation[];

  /**
   * Payload/body details. Use `null` when the endpoint has no request body.
   */
  requestBodyExample: RequestBody;

  /**
   * Copyable curl example from the backend API documentation.
   */
  curlExample: string;

  /**
   * Successful status code and body example from the backend API documentation.
   */
  successResponseExample: {
    status: number;
    body: SuccessResponse;
  };
}

export interface LogoutSuccessResponse {
  success: true;
  message: 'Logged out successfully';
}

export interface PhoneOtpRequestBody {
  countryCode: string;
  phoneNumber: string;
}

export interface SendOtpSuccessResponse {
  success: true;
  message: 'OTP sent successfully';
  data: {
    message: 'OTP sent successfully';
    requestId: string;
  };
}

export interface LoginSuccessResponse {
  success: true;
  message: 'OTP sent successfully';
  data: {
    message: 'If the account is valid, an OTP has been sent';
    requestId: string;
  };
}

export interface RegisterSuccessResponse {
  success: true;
  message: 'OTP sent successfully';
  data: {
    message: 'If the account is valid, an OTP has been sent';
    requestId: string;
  };
}

export interface VerifyOtpRequestBody {
  requestId: string;
  otpCode: string;
}

export interface VerifyOtpSuccessResponse {
  success: true;
  message: 'OTP verified successfully';
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
    required_name: boolean;
  };
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export interface RefreshTokenSuccessResponse {
  success: true;
  message: 'Token refreshed successfully';
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
  };
}

export interface ShowroomRole {
  showroom_id: number;
  showroom_name: string;
  role: string;
}

export interface GetProfileSuccessResponse {
  success: true;
  message: 'profile fetched';
  data: {
    name: string | null;
    phone_number: string | null;
    showroom_roles: ShowroomRole[];
  };
}

export interface UpdateProfileRequestBody {
  name: string;
}

export interface UpdateProfileSuccessResponse {
  success: true;
  message: 'profile updated';
  data: {
    name: string;
  };
}

export type ShowroomMemberRole = 'manager' | 'employee';

export interface ShowroomGeolocation {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}

export interface ShowroomData {
  id: number;
  name: string;
  showroom_logo: string | null;
  showroom_banner: string | null;
  geolocation: ShowroomGeolocation | null;
}

export interface ShowroomFormRequestBody {
  name?: string;
  geolocation?: ShowroomGeolocation;
  showroomLogo?: unknown;
  showroomBanner?: unknown;
  removeLogo?: boolean;
  removeBanner?: boolean;
}

export interface CreateShowroomSuccessResponse {
  success: true;
  message: 'showroom created';
  data: ShowroomData;
}

export interface UpdateShowroomSuccessResponse {
  success: true;
  message: 'showroom updated';
  data: ShowroomData;
}

export interface AddShowroomMemberRequestBody {
  user_id: number;
  role: ShowroomMemberRole;
}

export interface AddShowroomMemberSuccessResponse {
  success: true;
  message: 'member added';
  data: {
    showroom_id: number;
    user_id: number;
    role: ShowroomMemberRole;
  };
}

export interface ListShowroomMembersParams {
  page?: number;
  limit?: number;
}

export interface ShowroomMember {
  user_id: number;
  name: string | null;
  phone_number: string | null;
  role: ShowroomMemberRole | 'owner';
}

export interface ListShowroomMembersSuccessResponse {
  success: true;
  message: 'members retrieved';
  data: {
    members: ShowroomMember[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface RemoveShowroomMemberSuccessResponse {
  success: true;
  message: 'member removed';
  data: null;
}

export interface UpdateShowroomMemberRoleRequestBody {
  role: ShowroomMemberRole;
}

export interface UpdateShowroomMemberRoleSuccessResponse {
  success: true;
  message: 'member role updated';
  data: null;
}
