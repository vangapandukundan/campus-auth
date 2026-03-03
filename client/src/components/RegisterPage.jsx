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
    if (!form.name || !form.email) return setError('Name and email are required');
    setLoading(true); setError('');
    try {
      const { data } = await registerUser(form);
      login(data.token, data.user);
      navigate('/dashboard'); // go to dashboard after register
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ fontSize: 48 }}>🎓</div>
        <h2 style={s.title}>Create Account</h2>
        <p style={s.sub}>No password — ever</p>

        <input style={s.input} placeholder="Full Name"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={s.input} type="email" placeholder="University Email"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <select style={s.input} value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>

        {error && <p style={s.error}>⚠️ {error}</p>}

        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Creating...' : '🚀 Create Account'}
        </button>

        <p style={s.footer}>
          Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 16 },
  card:  { background: '#fff', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' },
  title: { fontSize: 26, fontWeight: 800, margin: '8px 0 4px' },
  sub:   { color: '#888', marginBottom: 24, fontSize: 14 },
  input: { width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 15, marginBottom: 12, outline: 'none', display: 'block' },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 12, background: '#fef2f2', padding: '8px 12px', borderRadius: 8 },
  btn:   { width: '100%', padding: 14, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 16 },
  footer:{ fontSize: 13, color: '#888' },
};
