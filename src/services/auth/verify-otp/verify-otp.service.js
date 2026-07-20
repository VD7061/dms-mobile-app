import { apiRequest } from '../../http';
import { verifyOtpEndpoint } from './verify-otp.api';

export function verifyOtp(payload) {
  return apiRequest(verifyOtpEndpoint, {
    auth: false,
    body: payload,
    method: 'POST',
    showroom: false,
  });
}
