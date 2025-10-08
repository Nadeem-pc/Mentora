import { useAuth } from "@/contexts/auth.context";
import { Navigate } from "react-router-dom";

const UnProtectedRoute = ({children}: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "therapist") return <Navigate to="/therapist/dashboard" replace />;
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};

export default UnProtectedRoute;