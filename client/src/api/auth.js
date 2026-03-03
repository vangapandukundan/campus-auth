import api from './authApi';

// Account creation
export const registerUser = (data)          => api.post('/auth/register', data);
export const getMe        = ()              => api.get('/auth/me');

// Biometric (WebAuthn)
export const webAuthnRegStart  = ()          => api.post('/auth/webauthn/register/start');
export const webAuthnRegFinish = (data)      => api.post('/auth/webauthn/register/finish', data);
export const webAuthnLoginStart  = (email)   => api.post('/auth/webauthn/login/start', { email });
export const webAuthnLoginFinish = (email, response) =>
  api.post('/auth/webauthn/login/finish', { email, response });

// TOTP
export const totpSetup  = ()                 => api.post('/auth/totp/setup');
export const totpVerify = (email, token)     => api.post('/auth/totp/verify', { email, token });

// Push
export const pushSend   = (email)            => api.post('/auth/push/send', { email });
export const pushVerify = (email, code)      => api.post('/auth/push/verify', { email, code });
