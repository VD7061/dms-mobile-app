import { httpClient } from '../../http';
import { verifyOtpEndpoint } from './verify-otp.api';

export function verifyOtp({ requestId, otpCode }) {
  return httpClient.post(verifyOtpEndpoint, { requestId, otpCode }, { meta: { auth: false } });
}
