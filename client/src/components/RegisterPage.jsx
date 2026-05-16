import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/auth';
import '../styles/RegisterPage.css';

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
    <div className="register-clay-page">
      <div className="clay-card">
        
        <div className="clay-header">
          <div className="clay-icon-wrap">🚀</div>
          <h2 className="clay-title">Join Campus</h2>
          <p className="clay-subtitle">Create your passwordless account today</p>
        </div>

        <div className="clay-form-group">
          <label className="clay-label">FULL NAME</label>
          <input 
            className="clay-input" 
            placeholder="e.g. Kundan Vangapandu"
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
          />
        </div>

        <div className="clay-form-group">
          <label className="clay-label">UNIVERSITY EMAIL</label>
          <input 
            className="clay-input" 
            type="email" 
            placeholder="student@iit.edu.in"
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
          />
        </div>

        <div className="clay-form-group">
          <label className="clay-label">SELECT YOUR ROLE</label>
          <div className="clay-role-grid">
            {roles.map(role => (
              <button 
                key={role.value}
                className={`clay-role-btn ${form.role === role.value ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: role.value })}
              >
                <span className="clay-role-emoji">{role.icon}</span>
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ color: '#e53e3e', fontSize: '13px', fontWeight: '600', textAlign: 'center', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        <button 
          className="clay-submit-btn" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="clay-footer">
          Already have an account?{' '}
          <Link to="/login" className="clay-link">
            Sign In Here
          </Link>
        </div>
        
      </div>
    </div>
  );
}
