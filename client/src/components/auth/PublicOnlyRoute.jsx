import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../common/Loader';
import useAuth from '../../hooks/useAuth';
import { getDefaultRouteForRole } from '../../utils/authRedirect';

export default function PublicOnlyRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#C7EABB',
        }}
      >
        <Loader message="Preparing authentication..." />
      </main>
    );
  }

  if (currentUser) {
    return <Navigate to={getDefaultRouteForRole(currentUser.role)} replace />;
  }

  return <Outlet />;
}
