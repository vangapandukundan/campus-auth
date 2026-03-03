import QRCode from 'qrcode.react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebAuthn } from '../hooks/useWebAuthn';
import { totpSetup } from '../api/auth';
 // NOTE: default import (not named)

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { register }     = useWebAuthn();
  const navigate         = useNavigate();
  const [msg,   setMsg]  = useState('');
  const [qrUrl, setQrUrl]= useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRegisterBiometric = async () => {
    setMsg(''); setQrUrl('');
    try {
      await register();
      setMsg('✅ Biometric registered! You can now login with fingerprint/face.');
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.error || e.message));
    }
  };

  const handleTotpSetup = async () => {
    setMsg(''); setQrUrl('');
    try {
      const { data } = await totpSetup();
      setQrUrl(data.otpauthUrl); // QR code URL
      setMsg('✅ Scan the QR code below with Google Authenticator');
    } catch (e) {
      setMsg('❌ ' + e.message);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>👋 Welcome, {user?.name}</h2>
            <p style={{ color: '#888', fontSize: 13 }}>{user?.email} · {user?.role}</p>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </div>

        {/* Status badge */}
        <div style={s.badge}>🛡️ Passwordless account — highly secure</div>

        {/* Action buttons */}
        <h3 style={s.sectionTitle}>Security Settings</h3>
        <div style={s.grid}>
          <button style={s.actionBtn} onClick={handleRegisterBiometric}>
            <div style={{ fontSize: 28 }}>🔑</div>
            <div style={{ fontWeight: 700 }}>Register Biometric</div>
            <div style={s.actionSub}>Fingerprint or Face ID</div>
          </button>
          <button style={s.actionBtn} onClick={handleTotpSetup}>
            <div style={{ fontSize: 28 }}>🔢</div>
            <div style={{ fontWeight: 700 }}>Setup OTP App</div>
            <div style={s.actionSub}>Google Authenticator</div>
          </button>
        </div>

        {/* Message */}
        {msg && (
          <p style={{ marginTop: 16, color: msg.startsWith('✅') ? '#16a34a' : '#dc2626', fontSize: 14, padding: '10px 14px', background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', borderRadius: 8 }}>
            {msg}
          </p>
        )}

        {/* QR Code for TOTP */}
        {qrUrl && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ marginBottom: 10, color: '#555', fontSize: 13 }}>
              Open Google Authenticator → + → Scan QR code:
            </p>
            <QRCode value={qrUrl} size={180} />
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card:        { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  logoutBtn:   { padding: '8px 16px', border: '2px solid #ef4444', borderRadius: 8, color: '#ef4444', background: '#fff', cursor: 'pointer', fontWeight: 600 },
  badge:       { background: '#f0fdf4', color: '#16a34a', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 20 },
  sectionTitle:{ fontSize: 15, fontWeight: 700, color: '#555', marginBottom: 12 },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  actionBtn:   { padding: '18px 12px', border: '2px solid #e5e7eb', borderRadius: 12, background: '#fafafa', cursor: 'pointer', textAlign: 'center', lineHeight: 1.8 },
  actionSub:   { fontSize: 11, color: '#999' },
};
