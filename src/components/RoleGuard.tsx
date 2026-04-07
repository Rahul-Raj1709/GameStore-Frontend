import { ReactNode } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";

interface RoleGuardProps {
  allowedRoles: Roles[];
  children: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role as Roles)) {
    return null; // Hide the component
  }

  return <>{children}</>;
};

// Custom Hook to check if a user can edit/delete a specific game
export const useGamePermissions = (gameOwnerName?: string) => {
  const { user } = useAuth();

  if (!user) return { canManage: false };

  // SuperAdmins can manage everything
  if (user.role === Roles.SuperAdmin) {
    return { canManage: true };
  }

  // Admins can only manage games they own
  if (
    user.role === Roles.Admin &&
    gameOwnerName &&
    user.username === gameOwnerName
  ) {
    return { canManage: true };
  }

  return { canManage: false };
};
