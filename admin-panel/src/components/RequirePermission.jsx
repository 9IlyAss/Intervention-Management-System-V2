// components/RequirePermission.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequirePermission = ({ permission, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || !user.permissions?.includes(permission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RequirePermission;
