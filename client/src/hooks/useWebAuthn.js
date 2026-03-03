import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import {
  webAuthnRegStart,
  webAuthnRegFinish,
  webAuthnLoginStart,
  webAuthnLoginFinish,
} from '../api/auth';

export function useWebAuthn() {
  // Register biometric on current device
  const register = async () => {
    const { data: options } = await webAuthnRegStart();
    // This line opens the Windows Hello / fingerprint dialog
    const response = await startRegistration(options);
    const { data: result } = await webAuthnRegFinish(response);
    return result;
  };

  // Login using registered biometric
  const login = async (email) => {
    const { data: options } = await webAuthnLoginStart(email);
    // This line opens the Windows Hello / fingerprint dialog
    const response = await startAuthentication(options);
    const { data: result } = await webAuthnLoginFinish(email, response);
    return result; // returns { token, user }
  };

  return { register, login };
}