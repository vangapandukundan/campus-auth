import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebAuthn } from '../hooks/useWebAuthn';
import { totpVerify, pushSend, pushVerify, faceLoginStart, faceLoginFinish } from '../api/auth';
import FaceCapture from './FaceCapture';
import '../styles/LoginPage.css';
import '../styles/RegisterPage.css'; // Import Claymorphism classes

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [method,   setMethod]   = useState('biometric');
  const [code,     setCode]     = useState('');
  const [step,     setStep]     = useState('email');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceData, setFaceData] = useState(null);

  const { login }                 = useAuth();
  const navigate                  = useNavigate();
  const { login: biometricLogin } = useWebAuthn();

  const switchMethod = (m) => {
    setMethod(m); setStep('email');
    setCode(''); setError('');
    setShowFaceCapture(false); setFaceData(null);
  };

  const handleFaceCapture = async (capturedFaceData) => {
    setShowFaceCapture(false);
    setFaceData(capturedFaceData);
    setLoading(true);
    try {
      const { data } = await faceLoginFinish(email, capturedFaceData);
      setSuccess(true);
      setTimeout(() => { login(data.token, data.user); navigate('/dashboard'); }, 800);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Face authentication failed.');
      setFaceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email) return setError('Please enter your university email');
    setError(''); setLoading(true);
    try {
      if (method === 'biometric') {
        const data = await biometricLogin(email);
        setSuccess(true);
        setTimeout(() => { login(data.token, data.user); navigate('/dashboard'); }, 800);
      } else if (method === 'face') {
        await faceLoginStart(email);
        setStep('face');
        setShowFaceCapture(true);
      } else if (method === 'push') {
        if (step === 'email') {
          await pushSend(email);
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
    { id: 'biometric', emoji: '🔑', label: 'Biometric' },
    { id: 'face',      emoji: '👤', label: 'Face ID' },
    { id: 'push',      emoji: '📲', label: 'Push Code' },
    { id: 'totp',      emoji: '🔢', label: 'OTP App' },
  ];

  return (
    <div className="login-page-container">
      {/* Face Capture Overlay */}
      {showFaceCapture && (
        <FaceCapture
          mode="verify"
          onCapture={handleFaceCapture}
          onClose={() => {
            setShowFaceCapture(false);
            setStep('email');
          }}
        />
      )}

      {/* 3D Floating Objects Background */}
      <div className="floating-objects-canvas">
        <div className="obj-3d obj-1"></div>
        <div className="obj-3d obj-2"></div>
        <div className="obj-3d obj-3"></div>
        <div className="obj-3d obj-4"></div>
      </div>

      <div className="login-content-wrapper fade-up">
        {/* Left Information Section */}
        <div className="login-info-section">
          <div className="portal-brand-box">
            <div className="clay-icon-wrap" style={{ width: 64, height: 64, margin: 0, fontSize: 32 }}>🎓</div>
            <h1 className="portal-title">CAMPUS-AUTH</h1>
          </div>
          <p className="portal-subtitle">
            This authentication portal is based on a seamless passwordless login system for campus applications.
          </p>
        </div>

        {/* Right Login Section */}
        <div className="login-card-section">
          <div className="clay-card">
            <h2 className="clay-title" style={{ textAlign: 'center' }}>Sign In</h2>
            <p className="clay-subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>Select your preferred login method.</p>

            <div className="clay-role-grid" style={{ marginBottom: 32, gap: 12 }}>
              {methods.map(m => (
                <button
                  key={m.id}
                  className={`clay-role-btn ${method === m.id ? 'active' : ''}`}
                  onClick={() => switchMethod(m.id)}
                  style={{ padding: '12px 6px', fontSize: '11px' }}
                >
                  <span className="clay-role-emoji" style={{ fontSize: 18 }}>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Step: Email Input */}
            {step === 'email' && (
              <div className="clay-form-group fade-up">
                <label className="clay-label">UNIVERSITY EMAIL</label>
                <input
                  className="clay-input"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
              </div>
            )}

            {/* Step: 2FA Input (OTP / Push) */}
            {step === 'code' && (
              <div className="clay-form-group fade-up">
                <label className="clay-label">VERIFICATION CODE</label>
                <input
                  className="clay-input"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: '800' }}
                />
                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => setStep('email')} 
                    className="clay-link"
                    style={{ background: 'none', border: 'none', fontSize: '13px', marginTop: '16px', cursor: 'pointer', display: 'inline-block' }}
                  >
                    ← Change Email
                  </button>
                </div>
              </div>
            )}

            {/* Success and Error Indicators */}
            {error && (
              <div style={{ color: '#e53e3e', fontSize: '13px', fontWeight: '600', textAlign: 'center', marginBottom: '16px' }}>
                ⚠️ {error}
              </div>
            )}
            
            {success && (
              <div className="animate-popIn" style={{ padding: '16px', textAlign: 'center', background: '#dcfce7', color: '#166534', borderRadius: '16px', fontWeight: '700', marginBottom: '20px', boxShadow: 'inset 4px 4px 10px rgba(0,0,0,0.05)' }}>
                ✅ Login Successful! Redirecting...
              </div>
            )}

            {!success && (
              <button 
                className="clay-submit-btn" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading 
                  ? 'Processing...' 
                  : step === 'email' 
                    ? `Continue with ${methods.find(m => m.id === method)?.label}`
                    : 'Verify & Sign In'
                }
              </button>
            )}

            <div className="clay-footer" style={{ marginTop: '24px' }}>
              First time here? <Link to="/register" className="clay-link">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
