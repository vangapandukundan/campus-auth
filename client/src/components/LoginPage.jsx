import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebAuthn } from '../hooks/useWebAuthn';
import { totpVerify, pushSend, pushVerify } from '../api/auth';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [method,   setMethod]   = useState('biometric');
  const [code,     setCode]     = useState('');
  const [step,     setStep]     = useState('email');
  const [demoCode, setDemoCode] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login }                 = useAuth();
  const navigate                  = useNavigate();
  const { login: biometricLogin } = useWebAuthn();

  const switchMethod = (m) => {
    setMethod(m); setStep('email');
    setCode(''); setError(''); setDemoCode('');
  };

  const handleSubmit = async () => {
    if (!email) return setError('Please enter your university email');
    setError(''); setLoading(true);
    try {
      if (method === 'biometric') {
        const data = await biometricLogin(email);
        login(data.token, data.user);
        navigate('/dashboard');
      } else if (method === 'push') {
        if (step === 'email') {
          const res = await pushSend(email);
          setDemoCode(res.data.demoCode || '');
          setStep('code');
        } else {
          const { data } = await pushVerify(email, code);
          login(data.token, data.user);
          navigate('/dashboard');
        }
      } else if (method === 'totp') {
        if (step === 'email') { setStep('code'); }
        else {
          const { data } = await totpVerify(email, code);
          login(data.token, data.user);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const methods = [
    { id: 'biometric', icon: '🔑', label: 'Biometric',   sub: 'Face / Fingerprint' },
    { id: 'push',      icon: '📲', label: 'Push Code',    sub: 'Phone notification' },
    { id: 'totp',      icon: '🔢', label: 'OTP App',      sub: 'Google Authenticator' },
  ];

  return (
    <div style={s.page}>
      {/* Left Panel */}
      <div style={s.leftPanel}>
        <div style={s.brand}>
          <div style={s.brandIcon}>🎓</div>
          <h1 style={s.brandName}>CampusAuth</h1>
          <p style={s.brandTagline}>Secure. Seamless. Passwordless.</p>
        </div>
        <div style={s.features}>
          {[
            { icon: '🛡️', text: 'Zero password risk'         },
            { icon: '⚡', text: 'Login in under 3 seconds'   },
            { icon: '📱', text: 'Works on any device'        },
            { icon: '🔒', text: 'FIDO2 / WebAuthn standard'  },
          ].map((f, i) => (
            <div key={i} style={s.featureItem}>
              <span style={s.featureIcon}>{f.icon}</span>
              <span style={s.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
        <div style={s.leftFooter}>
          © 2024 CampusAuth · All rights reserved
        </div>
      </div>

      {/* Right Panel */}
      <div style={s.rightPanel}>
        <div style={s.card}>
          {/* Header */}
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Welcome Back</h2>
            <p style={s.cardSub}>Sign in to your campus account</p>
          </div>

          {/* Divider */}
          <div style={s.divider} />

          {/* Method Tabs */}
          <p style={s.label}>SELECT LOGIN METHOD</p>
          <div style={s.tabs}>
            {methods.map(m => (
              <button key={m.id} onClick={() => switchMethod(m.id)}
                style={{ ...s.tab, ...(method === m.id ? s.tabActive : {}) }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: method === m.id ? '#93c5fd' : '#4a5568', marginTop: 2 }}>{m.sub}</div>
              </button>
            ))}
          </div>

          {/* Email Input */}
          <p style={s.label}>UNIVERSITY EMAIL</p>
          <input
            style={s.input}
            type="email"
            placeholder="student@university.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={step === 'code'}
          />

          {/* Code Input */}
          {step === 'code' && (
            <>
              <p style={s.label}>
                {method === 'push' ? 'PUSH CODE' : 'AUTHENTICATOR CODE'}
              </p>
              <input
                style={{ ...s.input, textAlign: 'center', letterSpacing: 12, fontSize: 24, fontWeight: 700 }}
                placeholder="• • • • • •"
                maxLength={8}
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              {demoCode && (
                <div style={s.demoBox}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>DEMO CODE →</span>
                  <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16, letterSpacing: 4 }}>{demoCode}</span>
                </div>
              )}
              <button onClick={() => setStep('email')} style={s.backBtn}>
                ← Use different email
              </button>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <span style={{ marginRight: 8 }}>⚠️</span>{error}
            </div>
          )}

          {/* Submit Button */}
          <button style={s.btn} onClick={handleSubmit} disabled={loading || !email}>
            {loading ? (
              <span>⏳ Authenticating...</span>
            ) : method === 'biometric' ? (
              <span>🔑 Continue with Biometric</span>
            ) : step === 'email' ? (
              <span>📤 Send Verification Code</span>
            ) : (
              <span>✅ Verify & Sign In</span>
            )}
          </button>

          {/* Footer */}
          <div style={s.cardFooter}>
            <span style={{ color: '#4a5568' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
              Create Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { display: 'flex', minHeight: '100vh', background: '#0a0e1a' },
  leftPanel:   { width: '40%', background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #1e2d45' },
  brand:       { marginBottom: 48 },
  brandIcon:   { fontSize: 52, marginBottom: 16 },
  brandName:   { fontSize: 32, fontWeight: 800, color: '#f0f9ff', letterSpacing: -0.5 },
  brandTagline:{ fontSize: 15, color: '#64748b', marginTop: 6 },
  features:    { display: 'flex', flexDirection: 'column', gap: 20 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 20, width: 40, height: 40, background: 'rgba(59,130,246,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textAlign: 'center', lineHeight: '40px' },
  featureText: { color: '#94a3b8', fontSize: 14 },
  leftFooter:  { color: '#2d3f55', fontSize: 12 },
  rightPanel:  { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:        { width: '100%', maxWidth: 460, background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 20, padding: '40px 40px' },
  cardHeader:  { marginBottom: 24 },
  cardTitle:   { fontSize: 26, fontWeight: 800, color: '#f0f9ff', letterSpacing: -0.3 },
  cardSub:     { fontSize: 14, color: '#64748b', marginTop: 6 },
  divider:     { height: 1, background: '#1e2d45', marginBottom: 24 },
  label:       { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#4a5568', marginBottom: 8 },
  tabs:        { display: 'flex', gap: 10, marginBottom: 24 },
  tab:         { flex: 1, padding: '12px 8px', border: '1px solid #1e2d45', borderRadius: 12, background: '#0a0e1a', cursor: 'pointer', textAlign: 'center', color: '#64748b', transition: 'all 0.2s' },
  tabActive:   { border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.08)', color: '#93c5fd' },
  input:       { width: '100%', padding: '13px 16px', border: '1px solid #1e2d45', borderRadius: 10, fontSize: 15, marginBottom: 16, background: '#0a0e1a', color: '#e2e8f0', display: 'block', transition: 'all 0.2s' },
  demoBox:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 12 },
  backBtn:     { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 },
  errorBox:    { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  btn:         { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 20, letterSpacing: 0.3 },
  cardFooter:  { textAlign: 'center', fontSize: 13 },
};

