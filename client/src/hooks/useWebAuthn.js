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

    // Ensure options are properly formatted for the browser API
    const registrationOptions = {
      ...options,
      // Don't force platform authenticator — allow any available method (fingerprint, PIN, etc.)
    };

    try {
      const response = await startRegistration(registrationOptions);
      const { data: result } = await webAuthnRegFinish(response);
      return result;
    } catch (err) {
      // Provide user-friendly error messages
      if (err.name === 'NotAllowedError') {
        throw new Error('Biometric registration was cancelled or timed out. Please try again and complete the prompt.');
      }
      if (err.name === 'InvalidStateError') {
        throw new Error('This biometric is already registered on this device.');
      }
      if (err.name === 'NotSupportedError') {
        throw new Error('Your device does not support biometric registration. Try using PIN instead.');
      }
      throw err;
    }
  };

  // Login using registered biometric
  const login = async (email) => {
    const { data: options } = await webAuthnLoginStart(email);

    try {
      const response = await startAuthentication(options);
      const { data: result } = await webAuthnLoginFinish(email, response);
      return result; // returns { token, user }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        throw new Error('Authentication was cancelled or timed out. Please try again.');
      }
      if (err.name === 'NotSupportedError') {
        throw new Error('Biometric login is not supported on this device.');
      }
      throw err;
    }
  };

  return { register, login };
}