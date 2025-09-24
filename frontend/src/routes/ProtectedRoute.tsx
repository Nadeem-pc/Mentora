import { LoadingSpinner } from "@/components/templates/Spinner";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return  <LoadingSpinner size="lg" />;
  }

  if (!user) return <Navigate to="/auth/form" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return  <Navigate to="*" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;