
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
  const [msg,     setMsg]    = useState('');
  const [qrUrl,   setQrUrl]  = useState('');
  const [msgType, setMsgType]= useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

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
      setMsg('Scan the QR code below with Google Authenticator.');
    } catch (e) {
      setMsgType('error');
      setMsg(e.message);
    }
  };

  const roleConfig = {
    student: { bg: 'rgba(59,130,246,0.1)',  color: '#93c5fd', border: 'rgba(59,130,246,0.3)',  icon: '🎓' },
    faculty: { bg: 'rgba(168,85,247,0.1)',  color: '#c4b5fd', border: 'rgba(168,85,247,0.3)',  icon: '👨‍🏫' },
    admin:   { bg: 'rgba(239,68,68,0.1)',   color: '#fca5a5', border: 'rgba(239,68,68,0.3)',   icon: '⚙️' },
  };
  const rc = roleConfig[user?.role] || roleConfig.student;

  const stats = [
    { icon: '🛡️', label: 'SECURITY',    value: 'Maximum',      color: '#22c55e', className: 'animate-shield' },
    { icon: '🔑', label: 'AUTH TYPE',   value: 'Passwordless', color: '#3b82f6', className: '' },
    { icon: '📱', label: 'DEVICE',      value: 'Verified',     color: '#a78bfa', className: '' },
    { icon: '⚡', label: 'LOGIN SPEED', value: '< 3 sec',      color: '#f59e0b', className: '' },
  ];

  return (
    <div style={d.page}>
      {/* ── Nav ── */}
      <nav style={d.nav}>
        <div style={d.navBrand}>
          <div style={d.navLogo}>🎓</div>
          <span style={d.navTitle}>CampusAuth</span>
          <div style={d.navDivider} />
          <span style={d.navSub}>Security Dashboard</span>
        </div>
        <div style={d.navRight}>
          <div style={d.navUserBox}>
            <div style={d.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#4a5568' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ ...d.rolePill, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
            {rc.icon} {user?.role}
          </div>
          <button onClick={handleLogout} style={d.logoutBtn}>
            ↩ Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <div style={d.main}>

        {/* Welcome Banner */}
        <div style={d.banner} className="animate-fadeInUp">
          <div style={d.bannerLeft}>
            <div style={d.bannerEmoji} className="animate-float">👋</div>
            <div>
              <h2 style={d.bannerTitle}>Welcome back, {user?.name?.split(' ')[0]}!</h2>
              <p style={d.bannerSub}>
                Your account is fully secured with passwordless authentication
              </p>
            </div>
          </div>
          <div style={d.bannerBadge}>
            <span style={{ fontSize: 22 }} className="animate-shield">🔐</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#86efac' }}>Account Secured</div>
              <div style={{ fontSize: 10, color: '#4a5568' }}>No password stored</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={d.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} style={{ ...d.statCard, animationDelay: `${i*0.1}s` }}
              className="animate-fadeInUp">
              <div style={{ ...d.statIconBox, borderColor: stat.color + '33' }}>
                <span style={{ fontSize: 22 }} className={stat.className}>{stat.icon}</span>
              </div>
              <div style={d.statLabel}>{stat.label}</div>
              <div style={{ ...d.statValue, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Method Cards */}
        <div style={d.sectionHeader}>
          <h3 style={d.sectionTitle}>🔧 Security Setup</h3>
          <p style={d.sectionSub}>Configure your login methods below</p>
        </div>

        <div style={d.methodGrid}>
          {/* Biometric */}
          <div
            style={{ ...d.methodCard, ...(hoveredCard === 'bio' ? d.methodCardHover : {}) }}
            onMouseEnter={() => setHoveredCard('bio')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={d.methodTop}>
              <div style={{ ...d.methodIconCircle, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                🔑
              </div>
              <div style={d.methodBadge}>Recommended</div>
            </div>
            <h4 style={d.methodTitle}>Biometric Auth</h4>
            <p style={d.methodSub}>Windows Hello · Face ID · Fingerprint</p>
            <p style={d.methodDesc}>
              Register your device once. Login instantly without typing anything — just your face or finger.
            </p>
            <div style={d.methodTags}>
              <span style={d.tag}>🚀 Fastest</span>
              <span style={d.tag}>🛡️ Most Secure</span>
            </div>
            <button style={{ ...d.methodBtn, background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)', color: '#93c5fd' }}
              onClick={handleRegisterBiometric}>
              🔑 Register Biometric →
            </button>
          </div>

          {/* OTP */}
          <div
            style={{ ...d.methodCard, ...(hoveredCard === 'otp' ? d.methodCardHover : {}) }}
            onMouseEnter={() => setHoveredCard('otp')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={d.methodTop}>
              <div style={{ ...d.methodIconCircle, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
                🔢
              </div>
              <div style={{ ...d.methodBadge, background: 'rgba(168,85,247,0.1)', color: '#c4b5fd', border: '1px solid rgba(168,85,247,0.2)' }}>
                Offline Works
              </div>
            </div>
            <h4 style={d.methodTitle}>Authenticator App</h4>
            <p style={d.methodSub}>Google Authenticator · Microsoft Auth</p>
            <p style={d.methodDesc}>
              Scan QR once with your phone. Get fresh 6-digit codes every 30 seconds — works offline too.
            </p>
            <div style={d.methodTags}>
              <span style={d.tag}>📵 Works Offline</span>
              <span style={d.tag}>🔄 30s Refresh</span>
            </div>
            <button style={{ ...d.methodBtn, background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)', color: '#c4b5fd' }}
              onClick={handleTotpSetup}>
              🔢 Setup OTP App →
            </button>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            ...d.msgBox,
            background: msgType === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${msgType === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color:  msgType === 'success' ? '#86efac' : '#fca5a5',
          }} className="animate-popIn">
            {msgType === 'success' ? '✅' : '❌'} {msg}
          </div>
        )}

        {/* QR Code */}
        {qrUrl && (
          <div style={d.qrWrap} className="animate-fadeInUp">
            <div style={d.qrCard}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
              <h4 style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 4 }}>Scan with Your Phone</h4>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                Open Google Authenticator → tap <strong style={{ color: '#93c5fd' }}>+</strong> → Scan QR code
              </p>
              <div style={d.qrBox}>
                <QRCode value={qrUrl} size={180} bgColor="#ffffff" fgColor="#0a0e1a" />
              </div>
              <p style={{ color: '#4a5568', fontSize: 11, marginTop: 16 }}>
                After scanning, use the 6-digit code to login via OTP App
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const d = {
  page:          { minHeight: '100vh', background: '#0a0e1a' },
  nav:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: 64, background: '#0f172a', borderBottom: '1px solid #1e2d45', position: 'sticky', top: 0, zIndex: 10 },
  navBrand:      { display: 'flex', alignItems: 'center', gap: 12 },
  navLogo:       { fontSize: 22 },
  navTitle:      { fontSize: 17, fontWeight: 800, color: '#f0f9ff' },
  navDivider:    { width: 1, height: 20, background: '#1e2d45' },
  navSub:        { fontSize: 12, color: '#4a5568' },
  navRight:      { display: 'flex', alignItems: 'center', gap: 16 },
  navUserBox:    { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:        { width: 34, height: 34, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' },
  rolePill:      { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
  logoutBtn:     { padding: '7px 16px', border: '1px solid #1e2d45', borderRadius: 8, color: '#64748b', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  main:          { maxWidth: 1000, margin: '0 auto', padding: '36px 24px' },
  banner:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', border: '1px solid #1e2d45', borderRadius: 18, padding: '26px 32px', marginBottom: 24, opacity: 0 },
  bannerLeft:    { display: 'flex', alignItems: 'center', gap: 16 },
  bannerEmoji:   { fontSize: 36 },
  bannerTitle:   { fontSize: 20, fontWeight: 800, color: '#f0f9ff', marginBottom: 4 },
  bannerSub:     { fontSize: 13, color: '#64748b' },
  bannerBadge:   { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '12px 18px' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 },
  statCard:      { background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 14, padding: '20px 16px', textAlign: 'center', opacity: 0 },
  statIconBox:   { width: 48, height: 48, borderRadius: 12, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  statLabel:     { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: '#4a5568', marginBottom: 6 },
  statValue:     { fontSize: 14, fontWeight: 700 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle:  { fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 },
  sectionSub:    { fontSize: 13, color: '#4a5568' },
  methodGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  methodCard:    { background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 18, padding: 26, transition: 'all 0.25s' },
  methodCardHover:{ border: '1px solid #3b82f6', transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(59,130,246,0.12)' },
  methodTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  methodIconCircle:{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 },
  methodBadge:   { padding: '4px 10px', background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, fontSize: 10, fontWeight: 700 },
  methodTitle:   { fontSize: 16, fontWeight: 800, color: '#f0f9ff', marginBottom: 4 },
  methodSub:     { fontSize: 11, color: '#4a5568', marginBottom: 12 },
  methodDesc:    { fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 14 },
  methodTags:    { display: 'flex', gap: 8, marginBottom: 16 },
  tag:           { padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2d45', borderRadius: 20, fontSize: 11, color: '#64748b' },
  methodBtn:     { width: '100%', padding: 12, border: '1px solid', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  msgBox:        { borderRadius: 12, padding: '14px 18px', fontSize: 14, marginBottom: 20 },
  qrWrap:        { display: 'flex', justifyContent: 'center', opacity: 0 },
  qrCard:        { background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 18, padding: '32px 40px', textAlign: 'center', maxWidth: 340 },
  qrBox:         { background: '#fff', padding: 16, borderRadius: 12, display: 'inline-block' },
};