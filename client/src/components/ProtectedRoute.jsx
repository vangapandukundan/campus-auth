import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for auth check before deciding
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100, fontSize: 18 }}>
        ⏳ Loading...
      </div>
    );
  }

  // If not logged in → redirect to login
  return user ? children : <Navigate to="/login" replace />;
}