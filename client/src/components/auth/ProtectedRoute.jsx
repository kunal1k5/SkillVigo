import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../common/Loader';
import useAuth from '../../hooks/useAuth';
import { getDefaultRouteForRole } from '../../utils/authRedirect';

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)',
        }}
      >
        <Loader message="Checking your session..." />
      </main>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDefaultRouteForRole(currentUser.role)} replace />;
  }

  return <Outlet />;
}
