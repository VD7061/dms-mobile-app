import type {
  ApiEndpointDocumentation,
  AddShowroomMemberRequestBody,
  AddShowroomMemberSuccessResponse,
  CreateShowroomSuccessResponse,
  GetProfileSuccessResponse,
  ListShowroomMembersParams,
  ListShowroomMembersSuccessResponse,
  LoginSuccessResponse,
  LogoutSuccessResponse,
  PhoneOtpRequestBody,
  RefreshTokenRequestBody,
  RefreshTokenSuccessResponse,
  RegisterSuccessResponse,
  RemoveShowroomMemberSuccessResponse,
  SendOtpSuccessResponse,
  ShowroomFormRequestBody,
  UpdateProfileRequestBody,
  UpdateProfileSuccessResponse,
  UpdateShowroomMemberRoleRequestBody,
  UpdateShowroomMemberRoleSuccessResponse,
  UpdateShowroomSuccessResponse,
  VerifyOtpRequestBody,
  VerifyOtpSuccessResponse,
} from './api.types';

declare module '@/services' {
  export const loginEndpoint: '/api/v1/auth/login';
  export const loginApi: ApiEndpointDocumentation<PhoneOtpRequestBody, LoginSuccessResponse>;
  export function login(payload: PhoneOtpRequestBody): Promise<LoginSuccessResponse>;

  export const logoutEndpoint: '/api/v1/auth/logout';
  export const logoutApi: ApiEndpointDocumentation<null, LogoutSuccessResponse>;
  export function logout(): Promise<LogoutSuccessResponse>;

  export const sendOtpEndpoint: '/api/v1/auth/send-otp';
  export const sendOtpApi: ApiEndpointDocumentation<PhoneOtpRequestBody, SendOtpSuccessResponse>;
  export function sendOtp(payload: PhoneOtpRequestBody): Promise<SendOtpSuccessResponse>;

  export const registerEndpoint: '/api/v1/auth/register';
  export const registerApi: ApiEndpointDocumentation<PhoneOtpRequestBody, RegisterSuccessResponse>;
  export function register(payload: PhoneOtpRequestBody): Promise<RegisterSuccessResponse>;

  export const verifyOtpEndpoint: '/api/v1/auth/verify-otp';
  export const verifyOtpApi: ApiEndpointDocumentation<
    VerifyOtpRequestBody,
    VerifyOtpSuccessResponse
  >;
  export function verifyOtp(payload: VerifyOtpRequestBody): Promise<VerifyOtpSuccessResponse>;

  export const refreshTokenEndpoint: '/api/v1/auth/refresh-token';
  export const refreshTokenApi: ApiEndpointDocumentation<
    RefreshTokenRequestBody,
    RefreshTokenSuccessResponse
  >;
  export function refreshToken(
    payload: RefreshTokenRequestBody
  ): Promise<RefreshTokenSuccessResponse>;

  export const getProfileEndpoint: '/api/v1/user/me';
  export const getProfileApi: ApiEndpointDocumentation<null, GetProfileSuccessResponse>;
  export function getProfile(): Promise<GetProfileSuccessResponse>;

  export const updateProfileEndpoint: '/api/v1/user/me';
  export const updateProfileApi: ApiEndpointDocumentation<
    UpdateProfileRequestBody,
    UpdateProfileSuccessResponse
  >;
  export function updateProfile(
    payload: UpdateProfileRequestBody
  ): Promise<UpdateProfileSuccessResponse>;

  export const createShowroomEndpoint: '/api/v1/showroom';
  export const createShowroomApi: ApiEndpointDocumentation<
    ShowroomFormRequestBody,
    CreateShowroomSuccessResponse
  >;
  export function createShowroom(
    payload: ShowroomFormRequestBody
  ): Promise<CreateShowroomSuccessResponse>;

  export const updateShowroomApi: ApiEndpointDocumentation<
    ShowroomFormRequestBody,
    UpdateShowroomSuccessResponse
  >;
  export function getUpdateShowroomEndpoint(showroomId: number | string): `/${string}`;
  export function updateShowroom(
    showroomId: number | string,
    payload: ShowroomFormRequestBody
  ): Promise<UpdateShowroomSuccessResponse>;

  export const addShowroomMemberApi: ApiEndpointDocumentation<
    AddShowroomMemberRequestBody,
    AddShowroomMemberSuccessResponse
  >;
  export function addShowroomMember(
    showroomId: number | string,
    payload: AddShowroomMemberRequestBody
  ): Promise<AddShowroomMemberSuccessResponse>;

  export const listShowroomMembersApi: ApiEndpointDocumentation<
    null,
    ListShowroomMembersSuccessResponse
  >;
  export function listShowroomMembers(
    showroomId: number | string,
    params?: ListShowroomMembersParams
  ): Promise<ListShowroomMembersSuccessResponse>;

  export const removeShowroomMemberApi: ApiEndpointDocumentation<
    null,
    RemoveShowroomMemberSuccessResponse
  >;
  export function removeShowroomMember(
    showroomId: number | string,
    userId: number | string
  ): Promise<RemoveShowroomMemberSuccessResponse>;

  export const updateShowroomMemberRoleApi: ApiEndpointDocumentation<
    UpdateShowroomMemberRoleRequestBody,
    UpdateShowroomMemberRoleSuccessResponse
  >;
  export function updateShowroomMemberRole(
    showroomId: number | string,
    userId: number | string,
    payload: UpdateShowroomMemberRoleRequestBody
  ): Promise<UpdateShowroomMemberRoleSuccessResponse>;
}

declare module '@/services/auth' {
  export {
    loginApi,
    loginEndpoint,
    login,
    logoutApi,
    logoutEndpoint,
    logout,
    refreshTokenApi,
    refreshTokenEndpoint,
    refreshToken,
    registerApi,
    registerEndpoint,
    register,
    sendOtpApi,
    sendOtpEndpoint,
    sendOtp,
    verifyOtpApi,
    verifyOtpEndpoint,
    verifyOtp,
  } from '@/services';
}

declare module '@/services/auth/login' {
  export { login, loginApi, loginEndpoint } from '@/services';
}

declare module '@/services/auth/logout' {
  export { logout, logoutApi, logoutEndpoint } from '@/services';
}

declare module '@/services/auth/refresh-token' {
  export { refreshToken, refreshTokenApi, refreshTokenEndpoint } from '@/services';
}

declare module '@/services/auth/send-otp' {
  export { sendOtp, sendOtpApi, sendOtpEndpoint } from '@/services';
}

declare module '@/services/auth/register' {
  export { register, registerApi, registerEndpoint } from '@/services';
}

declare module '@/services/auth/verify-otp' {
  export { verifyOtp, verifyOtpApi, verifyOtpEndpoint } from '@/services';
}

declare module '@/services/users' {
  export {
    getProfile,
    getProfileApi,
    getProfileEndpoint,
    updateProfile,
    updateProfileApi,
    updateProfileEndpoint,
  } from '@/services';
}

declare module '@/services/users/profile' {
  export {
    getProfile,
    getProfileApi,
    getProfileEndpoint,
    updateProfile,
    updateProfileApi,
    updateProfileEndpoint,
  } from '@/services';
}

declare module '@/services/showrooms' {
  export {
    addShowroomMember,
    addShowroomMemberApi,
    createShowroom,
    createShowroomApi,
    createShowroomEndpoint,
    getUpdateShowroomEndpoint,
    listShowroomMembers,
    listShowroomMembersApi,
    removeShowroomMember,
    removeShowroomMemberApi,
    updateShowroom,
    updateShowroomApi,
    updateShowroomMemberRole,
    updateShowroomMemberRoleApi,
  } from '@/services';
}

declare module '@/services/showrooms/create-showroom' {
  export { createShowroom, createShowroomApi, createShowroomEndpoint } from '@/services';
}

declare module '@/services/showrooms/update-showroom' {
  export { getUpdateShowroomEndpoint, updateShowroom, updateShowroomApi } from '@/services';
}

declare module '@/services/showrooms/members' {
  export {
    addShowroomMember,
    addShowroomMemberApi,
    listShowroomMembers,
    listShowroomMembersApi,
    removeShowroomMember,
    removeShowroomMemberApi,
    updateShowroomMemberRole,
    updateShowroomMemberRoleApi,
  } from '@/services';
}
