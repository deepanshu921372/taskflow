import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from './Spinner';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const { isLoading } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
