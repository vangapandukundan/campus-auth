import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/auth';

export default function RegisterPage() {
  const [form,    setForm]    = useState({ name: '', email: '', role: 'student' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async () => {
    if (!form.name || !form.email) return setError('All fields are required');
    setLoading(true); setError('');
    try {
      const { data } = await registerUser(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const roles = [
    { value: 'student', label: 'Student',  icon: '🎓' },
    { value: 'faculty', label: 'Faculty',  icon: '👨‍🏫' },
    { value: 'admin',   label: 'Admin',    icon: '⚙️' },
  ];

  return (
    <div style={r.page}>
      <div style={r.card}>
        {/* Header */}
        <div style={r.header}>
          <div style={r.logoBox}>🎓</div>
          <div>
            <h2 style={r.title}>Create Account</h2>
            <p style={r.sub}>Join your campus — no password required</p>
          </div>
        </div>

        <div style={r.divider} />

        {/* Name */}
        <label style={r.label}>FULL NAME</label>
        <input style={r.input} placeholder="e.g. Kundan Vangapandu"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

        {/* Email */}
        <label style={r.label}>UNIVERSITY EMAIL</label>
        <input style={r.input} type="email" placeholder="student@university.edu"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

        {/* Role */}
        <label style={r.label}>ROLE</label>
        <div style={r.roleGrid}>
          {roles.map(role => (
            <button key={role.value}
              onClick={() => setForm({ ...form, role: role.value })}
              style={{ ...r.roleBtn, ...(form.role === role.value ? r.roleBtnActive : {}) }}>
              <div style={{ fontSize: 22 }}>{role.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{role.label}</div>
            </button>
          ))}
        </div>

        {error && (
          <div style={r.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        <button style={r.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
        </button>

        {/* Info box */}
        <div style={r.infoBox}>
          <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.8 }}>
            🔑 After registering, set up biometric or OTP from your dashboard<br />
            🛡️ Your account is protected — no password ever stored
          </p>
        </div>

        <p style={r.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
            Sign In →
          </Link>
        </p>
      </div>
    </div>
  );
}

const r = {
  page:          { minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:          { width: '100%', maxWidth: 480, background: '#0f172a', border: '1px solid #1e2d45', borderRadius: 20, padding: '40px 40px' },
  header:        { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  logoBox:       { fontSize: 40, width: 64, height: 64, background: 'rgba(59,130,246,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title:         { fontSize: 22, fontWeight: 800, color: '#f0f9ff' },
  sub:           { fontSize: 13, color: '#64748b', marginTop: 4 },
  divider:       { height: 1, background: '#1e2d45', marginBottom: 24 },
  label:         { display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#4a5568', marginBottom: 8 },
  input:         { width: '100%', padding: '13px 16px', border: '1px solid #1e2d45', borderRadius: 10, fontSize: 15, marginBottom: 20, background: '#0a0e1a', color: '#e2e8f0', display: 'block' },
  roleGrid:      { display: 'flex', gap: 10, marginBottom: 20 },
  roleBtn:       { flex: 1, padding: '14px 8px', border: '1px solid #1e2d45', borderRadius: 12, background: '#0a0e1a', cursor: 'pointer', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  roleBtnActive: { border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.08)', color: '#93c5fd' },
  errorBox:      { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16, display: 'flex', gap: 8 },
  btn:           { width: '100%', padding: 14, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 },
  infoBox:       { background: 'rgba(15,23,42,0.8)', border: '1px solid #1e2d45', borderRadius: 10, padding: '12px 16px', marginBottom: 20 },
  footer:        { textAlign: 'center', fontSize: 13, color: '#4a5568' },
};
