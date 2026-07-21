import { httpClient } from '../../http';
import { sendOtpEndpoint } from './send-otp.api';

export function sendOtp({ countryCode, phoneNumber }) {
  return httpClient.post(sendOtpEndpoint, { countryCode, phoneNumber }, { meta: { auth: false } });
}
