import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebAuthn } from '../hooks/useWebAuthn';
import { totpSetup } from '../api/auth';
import QRCode from 'qrcode.react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { register }     = useWebAuthn();
  const navigate         = useNavigate();
  const [msg,    setMsg]  = useState('');
  const [qrUrl,  setQrUrl]= useState('');
  const [msgType,setMsgType]=useState(''); // 'success' | 'error'

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleRegisterBiometric = async () => {
    setMsg(''); setQrUrl('');
    try {
      await register();
      setMsgType('success');
      setMsg('Biometric registered! You can now login with fingerprint or face.');
    } catch (e) {
      setMsgType('error');
      setMsg(e.response?.data?.error || e.message);
    }
  };

  const handleTotpSetup = async () => {
    setMsg(''); setQrUrl('');
    try {
      const { data } = await totpSetup();
      setQrUrl(data.otpauthUrl);
      setMsgType('success');
      setMsg('Scan the QR code with Google Authenticator on your phone.');
    } catch (e) {
      setMsgType('error');
      setMsg(e.message);
    }
  };

  const roleColors = {
    student: { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
    faculty: { bg: 'rgba(168,85,247,0.1)', color: '#c4b5fd', border: 'rgba(168,85,247,0.3)' },
    admin:   { bg: 'rgba(239,68,68,0.1)',  color: '#fca5a5', border: 'rgba(239,68,68,0.3)'  },
  };
  const rc = roleColors[user?.role] || roleColors.student;

  return (
    <div style={d.page}>
      {/* Top Nav */}
      <nav style={d.nav}>
        <div style={d.navBrand}>
          <span style={{ fontSize: 22 }}>🎓</span>
          <span style={d.navTitle}>CampusAuth</span>
        </div>
        <div style={d.navRight}>
          <div style={d.navUser}>
            <div style={d.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={d.logoutBtn}>Sign Out</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={d.main}>

        {/* Welcome Banner */}
        <div style={d.banner}>
          <div>
            <h2 style={d.bannerTitle}>Good day, {user?.name?.split(' ')[0]} 👋</h2>
            <p style={d.bannerSub}>Your account is secured with passwordless authentication</p>
          </div>
          <div style={{ ...d.roleBadge, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
            {user?.role?.toUpperCase()}
          </div>
        </div>

        {/* Stats Row */}
        <div style={d.statsRow}>
          {[
            { icon: '🛡️', label: 'Security Level', value: 'High'       },
            { icon: '🔑', label: 'Auth Methods',   value: 'Passwordless'},
            { icon: '📱', label: 'Device Trust',   value: 'Verified'   },
            { icon: '⚡', label: 'Login Speed',    value: '< 3 seconds' },
          ].map((stat, i) => (
            <div key={i} style={d.statCard}>
              <div style={d.statIcon}>{stat.icon}</div>
              <div style={d.statLabel}>{stat.label}</div>
              <div style={d.statValue}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Security Setup */}
        <div style={d.section}>
          <h3 style={d.sectionTitle}>Security Setup</h3>
          <p style={d.sectionSub}>Configure your passwordless login methods</p>

          <div style={d.methodGrid}>
            {/* Biometric Card */}
            <div style={d.methodCard}>
              <div style={d.methodHeader}>
                <div style={{ ...d.methodIconBox, background: 'rgba(59,130,246,0.1)' }}>🔑</div>
                <div>
                  <div style={d.methodTitle}>Biometric Auth</div>
                  <div style={d.methodSub}>Windows Hello · Face ID · Fingerprint</div>
                </div>
              </div>
              <p style={d.methodDesc}>
                Register your device biometric once. Login instantly using your fingerprint or face — no code needed.
              </p>
              <button style={d.methodBtn} onClick={handleRegisterBiometric}>
                Register Biometric →
              </button>
            </div>

            {/* TOTP Card */}
            <div style={d.methodCard}>
              <div style={d.methodHeader}>
                <div style={{ ...d.methodIconBox, background: 'rgba(168,85,247,0.1)' }}>🔢</div>
                <div>
                  <div style={d.methodTitle}>Authenticator App</div>
                  <div style={d.methodSub}>Google Authenticator · Microsoft Auth</div>
                </div>
              </div>
              <p style={d.methodDesc}>
                Scan QR code once with your phone. Get 6-digit codes that refresh every 30 seconds.
              </p>
              <button style={{ ...d.methodBtn, background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)', color: '#c4b5fd' }}
                onClick={handleTotpSetup}>
                Setup OTP App →
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            ...d.msgBox,
            background: msgType === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${msgType === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: msgType === 'success' ? '#86efac' : '#fca5a5',
          }}>
            {msgType === 'success' ? '✅' : '❌'} {msg}
          </div>
        )}

        {/* QR Code */}
        {qrUrl && (
          <div style={d.qrSection}>
            <div style={d.qrCard}>
              <h4 style={{ color: '#e2e8f0', marginBottom: 4 }}>Scan QR Code</h4>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
                Open Google Authenticator → tap + → Scan QR code
              </p>
              <div style={d.qrBox}>
                <QRCode value={qrUrl} size={180} bgColor="#ffffff" fgColor="#0a0e1a" />
              </div>
              <p style={{ color: '#4a5568', fontSize: 11, marginTop: 16 }}>
                After scanning, enter the 6-digit code when logging in via OTP App
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const d = {
  page:        { minHeight: '100vh', background: '#0a0e1a' },
  nav:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: 64, background: '#0f172a', borderBottom: '1px solid #1e2d45', position: 'sticky', top: 0, zIndex: 10 },
  navBrand:    { display: 'flex', alignItems: 'center', gap: 10 },
  navTitle:    { fontSize: 18, fontWeight: 800, color: '#f0f9ff', letterSpacing: -0.3 },
  navRight:    { display: 'flex', alignItems: 'center', gap: 20 },
  navUser:     { display: 'flex', alignItems: 'center', gap: 12 },
  avatar:      { width: 36, height: 36, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' },
  logoutBtn:   { padding: '8px 18px', border: '1px solid #1e2d45', borderRadius: 8, color: '#64748b', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  main:        { maxWidth: 1000, margin: '0 auto', padding: '40px 24px' },
  banner:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', border: '1px solid #1e2d45', borderRadius: 16, padding: '28px 32px', marginBottom: 24 },
  bannerTitle: { fontSize: 22, fontWeight: 800, color: '#f0f9ff', marginBottom: 6 },
  bannerSub:   { fontSize: 14, color: '#64748b' },
  roleBadge:   { padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1.5 },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 },
  statCard:    { background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 14, padding: '20px 16px', textAlign: 'center' },
  statIcon:    { fontSize: 24, marginBottom: 10 },
  statLabel:   { fontSize: 11, color: '#4a5568', fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 },
  statValue:   { fontSize: 14, fontWeight: 700, color: '#93c5fd' },
  section:     { marginBottom: 24 },
  sectionTitle:{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 },
  sectionSub:  { fontSize: 13, color: '#4a5568', marginBottom: 20 },
  methodGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  methodCard:  { background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 16, padding: 24 },
  methodHeader:{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 },
  methodIconBox:{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  methodTitle: { fontSize: 15, fontWeight: 700, color: '#e2e8f0' },
  methodSub:   { fontSize: 11, color: '#4a5568', marginTop: 3 },
  methodDesc:  { fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 18 },
  methodBtn:   { width: '100%', padding: '11px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, color: '#93c5fd', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  msgBox:      { borderRadius: 12, padding: '14px 18px', fontSize: 14, marginBottom: 24 },
  qrSection:   { display: 'flex', justifyContent: 'center' },
  qrCard:      { background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 320 },
  qrBox:       { background: '#ffffff', padding: 16, borderRadius: 12, display: 'inline-block' },
};