import { useState } from 'react';
import { totpVerify } from '../api/auth';

export default function TOTPInput({ email, onSuccess, onError }) {
  const [token,   setToken]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (token.length !== 6) return onError?.('Enter a 6-digit code');
    setLoading(true);
    try {
      const { data } = await totpVerify(email, token);
      onSuccess?.(data);
    } catch (e) { onError?.(e.response?.data?.error || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <input
        placeholder="6-digit code"
        maxLength={6}
        value={token}
        onChange={e => setToken(e.target.value.replace(/\D/g, ''))} // numbers only
        style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, textAlign: 'center', letterSpacing: 10, fontSize: 24, marginBottom: 8 }}
      />
      <button onClick={handle} disabled={loading || token.length !== 6}
        style={{ width: '100%', padding: 12, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: token.length !== 6 ? 0.6 : 1 }}>
        {loading ? '⏳ Verifying...' : '🔢 Verify OTP'}
      </button>
    </div>
  );
}