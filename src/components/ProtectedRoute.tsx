import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  allowedRoles?: Roles[]; // <-- New prop
  redirectTo?: string;
}

export const ProtectedRoute = ({
  requireAuth = true,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If the route requires specific roles, check if the user has one of them
  if (requireAuth && allowedRoles && user) {
    if (!allowedRoles.includes(user.role as Roles)) {
      // Redirect to home if they are logged in but lack permissions
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
