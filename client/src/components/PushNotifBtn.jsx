import { useState } from 'react';
import { pushSend, pushVerify } from '../api/auth';

export default function PushNotifBtn({ email, onSuccess, onError }) {
  const [step,    setStep]    = useState('send');
  const [code,    setCode]    = useState('');
  const [demo,    setDemo]    = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const { data } = await pushSend(email);
      setDemo(data.demoCode || '');
      setStep('verify');
    } catch (e) { onError?.(e.message); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data } = await pushVerify(email, code);
      onSuccess?.(data);
    } catch (e) { onError?.(e.response?.data?.error || 'Invalid code'); }
    finally { setLoading(false); }
  };

  if (step === 'verify') return (
    <div>
      {demo && <p style={{ color: '#6366f1', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>📱 Demo Code: <strong>{demo}</strong></p>}
      <input placeholder="Enter 6-digit code" value={code}
        onChange={e => setCode(e.target.value)}
        style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, textAlign: 'center', letterSpacing: 8, fontSize: 20, marginBottom: 8 }} />
      <button onClick={handleVerify} disabled={loading}
        style={{ width: '100%', padding: 12, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
        {loading ? '⏳ Verifying...' : '✅ Verify Code'}
      </button>
    </div>
  );

  return (
    <button onClick={handleSend} disabled={loading || !email}
      style={{ width: '100%', padding: 12, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
      {loading ? '📤 Sending...' : '📲 Send Push Code'}
    </button>
  );
}