import { useState } from 'react';
import { useWebAuthn } from '../hooks/useWebAuthn';

export default function BiometricBtn({ email, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const { login } = useWebAuthn();

  const handle = async () => {
    if (!email) return onError?.('Please enter your email first');
    setLoading(true);
    try {
      const data = await login(email);
      onSuccess?.(data);
    } catch (e) {
      onError?.(e.response?.data?.error || 'Biometric login failed');
    } finally { setLoading(false); }
  };

  return (
    <button onClick={handle} disabled={loading || !email}
      style={{ width: '100%', padding: 12, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: (!email || loading) ? 0.6 : 1 }}>
      {loading ? '⏳ Authenticating...' : '🔑 Login with Biometric'}
    </button>
  );
}