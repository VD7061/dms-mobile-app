import { apiRequest } from '../../http';
import { sendOtpEndpoint } from './send-otp.api';

export function sendOtp(payload) {
  return apiRequest(sendOtpEndpoint, {
    auth: false,
    body: payload,
    method: 'POST',
    showroom: false,
  });
}
