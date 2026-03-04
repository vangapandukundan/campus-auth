
import { useState, useEffect } from 'react';
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
  const [success,  setSuccess]  = useState(false);

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
        setSuccess(true);
        setTimeout(() => { login(data.token, data.user); navigate('/dashboard'); }, 800);
      } else if (method === 'push') {
        if (step === 'email') {
          const res = await pushSend(email);
          setDemoCode(res.data.demoCode || '');
          setStep('code');
        } else {
          const { data } = await pushVerify(email, code);
          setSuccess(true);
          setTimeout(() => { login(data.token, data.user); navigate('/dashboard'); }, 800);
        }
      } else if (method === 'totp') {
        if (step === 'email') { setStep('code'); }
        else {
          const { data } = await totpVerify(email, code);
          setSuccess(true);
          setTimeout(() => { login(data.token, data.user); navigate('/dashboard'); }, 800);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const methods = [
    { id: 'biometric', icon: '⬡',  emoji: '🔑', label: 'Biometric',  sub: 'Face / Fingerprint' },
    { id: 'push',      icon: '◈',  emoji: '📲', label: 'Push Code',  sub: 'Phone notification'  },
    { id: 'totp',      icon: '◉',  emoji: '🔢', label: 'OTP App',    sub: 'Authenticator app'   },
  ];

  // Features that type out one by one
  const features = [
    { icon: '🛡️', text: 'Zero password risk',        delay: '0.1s' },
    { icon: '⚡',  text: 'Login in under 3 seconds',  delay: '0.2s' },
    { icon: '📱',  text: 'Works on any device',       delay: '0.3s' },
    { icon: '🔒',  text: 'FIDO2 / WebAuthn standard', delay: '0.4s' },
  ];

  return (
    <div style={s.page}>
      {/* ── Left Panel ── */}
      <div style={s.leftPanel} className="animate-fadeInLeft">

        {/* Animated background dots */}
        <div style={s.bgDots} aria-hidden>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{
              ...s.dot,
              width:  `${40 + i*20}px`,
              height: `${40 + i*20}px`,
              top:    `${10 + i*12}%`,
              left:   `${5  + i*8}%`,
              animationDelay: `${i*0.4}s`,
              animationDuration: `${3 + i*0.5}s`,
            }} className="animate-float" />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand */}
          <div style={s.brand}>
            <div style={s.brandIconWrap} className="animate-shield">
              <span style={{ fontSize: 42 }}>🎓</span>
            </div>
            <h1 style={s.brandName}>CampusAuth</h1>
            <p style={s.brandTagline}>
              Secure<span style={s.dot2}>·</span>
              Seamless<span style={s.dot2}>·</span>
              Passwordless
            </p>
          </div>

          {/* Feature list */}
          <div style={s.features}>
            {features.map((f, i) => (
              <div key={i} style={{ ...s.featureItem, animationDelay: f.delay }}
                className="animate-fadeInUp">
                <div style={s.featureIconBox}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                </div>
                <span style={s.featureText}>{f.text}</span>
                <span style={s.featureTick}>✓</span>
              </div>
            ))}
          </div>

          {/* Security badge */}
          <div style={s.secBadge}>
            <span style={{ fontSize: 20 }}>🔐</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd' }}>Enterprise Grade Security</div>
              <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>FIDO2 · WebAuthn · AES-256</div>
            </div>
          </div>
        </div>

        <div style={s.leftFooter}>© 2024 CampusAuth · All rights reserved</div>
      </div>

      {/* ── Right Panel ── */}
      <div style={s.rightPanel}>
        <div style={s.card} className="animate-fadeInUp">

          {/* Success overlay */}
          {success && (
            <div style={s.successOverlay}>
              <div style={s.successIcon} className="animate-popIn">✅</div>
              <div style={{ color: '#86efac', fontWeight: 700, fontSize: 16 }}>Authenticated!</div>
              <div style={{ color: '#4a5568', fontSize: 13 }}>Redirecting to dashboard...</div>
            </div>
          )}

          {/* Header */}
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Welcome Back</h2>
            <p style={s.cardSub}>Sign in to your campus account</p>
          </div>
          <div style={s.divider} />

          {/* Method selector */}
          <p style={s.label}>SELECT LOGIN METHOD</p>
          <div style={s.tabs}>
            {methods.map(m => (
              <button key={m.id} onClick={() => switchMethod(m.id)}
                style={{ ...s.tab, ...(method === m.id ? s.tabActive : {}) }}>
                {/* Animated glow dot when active */}
                {method === m.id && <div style={s.activeGlow} />}
                <div style={{ fontSize: 24, marginBottom: 4 }}>{m.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: method === m.id ? '#93c5fd' : '#4a5568', marginTop: 2 }}>
                  {m.sub}
                </div>
              </button>
            ))}
          </div>

          {/* Email */}
          <p style={s.label}>UNIVERSITY EMAIL</p>
          <div style={s.inputWrap}>
            <span style={s.inputIcon}>✉️</span>
            <input style={s.input} type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={step === 'code'}
            />
          </div>

          {/* Code */}
          {step === 'code' && (
            <div className="animate-fadeInUp">
              <p style={s.label}>
                {method === 'push' ? '📲 PUSH CODE' : '🔢 AUTHENTICATOR CODE'}
              </p>
              <input
                style={{ ...s.input, textAlign: 'center', letterSpacing: 14, fontSize: 26, fontWeight: 800, padding: '14px 16px' }}
                placeholder="• • • • • •"
                maxLength={8}
                value={code}
                onChange={e => setCode(e.target.value)}
                autoFocus
              />
              {demoCode && (
                <div style={s.demoBox}>
                  <span style={{ color: '#64748b', fontSize: 11, letterSpacing: 1 }}>DEMO CODE</span>
                  <span style={{ color: '#3b82f6', fontWeight: 800, fontSize: 18, letterSpacing: 6 }}>
                    {demoCode}
                  </span>
                </div>
              )}
              <button onClick={() => setStep('email')} style={s.backBtn}>
                ← Use different email
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={s.errorBox} className="animate-fadeInUp">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            style={{ ...s.btn, ...(loading ? {} : {}) }}
            className={!loading && !error ? 'animate-pulseGlow' : ''}
            onClick={handleSubmit}
            disabled={loading || !email}
          >
            {loading
              ? <><span className="animate-spin">⟳</span> &nbsp;Authenticating...</>
              : method === 'biometric' ? '🔑  Continue with Biometric'
              : step === 'email'       ? '📤  Send Verification Code'
              :                          '✅  Verify & Sign In'
            }
          </button>

          <div style={s.cardFooter}>
            <span style={{ color: '#4a5568' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
              Create Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:         { display: 'flex', minHeight: '100vh', background: '#0a0e1a' },
  leftPanel:    { width: '40%', background: 'linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%)', padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #1e2d45', position: 'relative', overflow: 'hidden' },
  bgDots:       { position: 'absolute', inset: 0, pointerEvents: 'none' },
  dot:          { position: 'absolute', borderRadius: '50%', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.08)' },
  brand:        { marginBottom: 48 },
  brandIconWrap:{ width: 72, height: 72, background: 'rgba(59,130,246,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid rgba(59,130,246,0.2)' },
  brandName:    { fontSize: 30, fontWeight: 800, color: '#f0f9ff', letterSpacing: -0.5, marginBottom: 6 },
  brandTagline: { fontSize: 13, color: '#4a5568' },
  dot2:         { margin: '0 8px', color: '#3b82f6' },
  features:     { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 },
  featureItem:  { display: 'flex', alignItems: 'center', gap: 14, opacity: 0 },
  featureIconBox:{ width: 38, height: 38, background: 'rgba(59,130,246,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(59,130,246,0.15)' },
  featureText:  { color: '#94a3b8', fontSize: 14, flex: 1 },
  featureTick:  { color: '#3b82f6', fontWeight: 700, fontSize: 16 },
  secBadge:     { display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 14, padding: '14px 18px' },
  leftFooter:   { color: '#2d3f55', fontSize: 11, position: 'relative', zIndex: 1 },
  rightPanel:   { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:         { width: '100%', maxWidth: 460, background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 20, padding: '40px 40px', position: 'relative', overflow: 'hidden' },
  successOverlay:{ position: 'absolute', inset: 0, background: 'rgba(10,14,26,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 20, borderRadius: 20 },
  successIcon:  { fontSize: 52, opacity: 0 },
  cardHeader:   { marginBottom: 22 },
  cardTitle:    { fontSize: 26, fontWeight: 800, color: '#f0f9ff', letterSpacing: -0.3 },
  cardSub:      { fontSize: 14, color: '#64748b', marginTop: 6 },
  divider:      { height: 1, background: '#1e2d45', marginBottom: 22 },
  label:        { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#4a5568', marginBottom: 8 },
  tabs:         { display: 'flex', gap: 10, marginBottom: 22 },
  tab:          { flex: 1, padding: '12px 8px', border: '1px solid #1e2d45', borderRadius: 12, background: '#0a0e1a', cursor: 'pointer', textAlign: 'center', color: '#64748b', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' },
  tabActive:    { border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.08)', color: '#93c5fd' },
  activeGlow:   { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 2, background: 'linear-gradient(90deg,transparent,#3b82f6,transparent)', borderRadius: 2 },
  inputWrap:    { position: 'relative', marginBottom: 16 },
  inputIcon:    { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' },
  input:        { width: '100%', padding: '13px 16px 13px 42px', border: '1px solid #1e2d45', borderRadius: 10, fontSize: 15, background: '#0a0e1a', color: '#e2e8f0', display: 'block', transition: 'all 0.2s' },
  demoBox:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 16px', margin: '10px 0' },
  backBtn:      { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13, margin: '8px 0 16px', padding: 0 },
  errorBox:     { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  btn:          { width: '100%', padding: 14, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 20, letterSpacing: 0.3, transition: 'all 0.2s' },
  cardFooter:   { textAlign: 'center', fontSize: 13 },
};
