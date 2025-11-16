import { useAuth } from '../hook/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isAdmin, isClient, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner text-accent"></span>
          <p>Vérification des accès...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    // Rediriger vers le login approprié selon la route
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = 
      (allowedRoles.includes('ROLE_ADMIN') && isAdmin) ||
      (allowedRoles.includes('ROLE_CLIENT') && isClient);

    if (!hasRequiredRole) {
      const redirectPath = isAdmin ? '/admin/dashboard' : '/';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
}

export default ProtectedRoute;