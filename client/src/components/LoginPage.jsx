import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebAuthn } from '../hooks/useWebAuthn';
import { totpVerify, pushSend, pushVerify } from '../api/auth';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [method,   setMethod]   = useState('biometric'); // biometric | push | totp
  const [code,     setCode]     = useState('');
  const [step,     setStep]     = useState('email');     // email | code
  const [demoCode, setDemoCode] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login }               = useAuth();
  const navigate                = useNavigate();
  const { login: biometricLogin } = useWebAuthn();

  // Change method and reset state
  const switchMethod = (m) => {
    setMethod(m);
    setStep('email');
    setCode('');
    setError('');
    setDemoCode('');
  };

  const handleSubmit = async () => {
    if (!email) return setError('Please enter your email');
    setError('');
    setLoading(true);

    try {
      if (method === 'biometric') {
        // Opens Windows Hello / Touch ID prompt
        const data = await biometricLogin(email);
        login(data.token, data.user);
        navigate('/dashboard');

      } else if (method === 'push') {
        if (step === 'email') {
          const res = await pushSend(email);
          setDemoCode(res.data.demoCode || ''); // shown only in demo mode
          setStep('code');
        } else {
          const { data } = await pushVerify(email, code);
          login(data.token, data.user);
          navigate('/dashboard');
        }

      } else if (method === 'totp') {
        if (step === 'email') {
          setStep('code'); // just move to code input
        } else {
          const { data } = await totpVerify(email, code);
          login(data.token, data.user);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { id: 'biometric', icon: '🔑', label: 'Biometric',  sub: 'Face / Fingerprint' },
    { id: 'push',      icon: '📲', label: 'Push Code',   sub: 'Phone notification' },
    { id: 'totp',      icon: '🔢', label: 'OTP App',     sub: 'Google Authenticator' },
  ];

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ fontSize: 48 }}>🎓</div>
        <h2 style={s.title}>Campus Login</h2>
        <p style={s.sub}>No password needed</p>

        {/* Method selector tabs */}
        <div style={s.tabs}>
          {methods.map(m => (
            <button key={m.id} onClick={() => switchMethod(m.id)}
              style={{ ...s.tab, ...(method === m.id ? s.tabOn : {}) }}>
              <div style={{ fontSize: 20 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: '#999' }}>{m.sub}</div>
            </button>
          ))}
        </div>

        {/* Email input — always shown */}
        <input style={s.input} type="email" placeholder="University email (e.g. student@uni.edu)"
          value={email} onChange={e => setEmail(e.target.value)}
          disabled={step === 'code'} // lock email after code is sent
        />

        {/* Code input — shown after sending push/totp code */}
        {step === 'code' && (
          <div>
            <input
              style={{ ...s.input, textAlign: 'center', letterSpacing: 8, fontSize: 22 }}
              placeholder="Enter 6-digit code"
              maxLength={8}
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            {/* Demo mode: show the code on screen for testing */}
            {demoCode && (
              <p style={{ color: '#6366f1', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>
                📱 Demo Code: <strong>{demoCode}</strong>
              </p>
            )}
            <button onClick={() => setStep('email')} style={s.backBtn}>
              ← Use different email
            </button>
          </div>
        )}

        {/* Error message */}
        {error && <p style={s.error}>⚠️ {error}</p>}

        {/* Main action button */}
        <button style={s.btn} onClick={handleSubmit} disabled={loading || !email}>
          {loading ? '⏳ Please wait...' :
           method === 'biometric' ? '🔑 Continue with Biometric' :
           step === 'email'       ? '📤 Send Code' :
                                    '✅ Verify Code'}
        </button>

        <p style={s.footer}>
          New user? <Link to="/register" style={{ color: '#6366f1', fontWeight: 600 }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 16 },
  card:    { background: '#fff', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' },
  title:   { fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '8px 0 4px' },
  sub:     { color: '#888', marginBottom: 24, fontSize: 14 },
  tabs:    { display: 'flex', gap: 8, marginBottom: 20 },
  tab:     { flex: 1, padding: '10px 6px', border: '2px solid #e5e7eb', borderRadius: 12, background: '#fff', cursor: 'pointer', transition: 'all 0.2s' },
  tabOn:   { borderColor: '#6366f1', background: '#f5f3ff' },
  input:   { width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 15, marginBottom: 12, outline: 'none', display: 'block' },
  error:   { color: '#ef4444', fontSize: 13, marginBottom: 12, background: '#fef2f2', padding: '8px 12px', borderRadius: 8 },
  btn:     { width: '100%', padding: 14, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 16 },
  backBtn: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 13, marginBottom: 12 },
  footer:  { fontSize: 13, color: '#888' },
};
