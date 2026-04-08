import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";
import { GameCatalog } from "@/features/games/components/GameCatalog";
import { AdminDashboard } from "@/features/games/components/AdminDashboard";
import { CustomerDashboard } from "@/features/games/components/CustomerDashboard";

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  // 1. Guest View (Not logged in)
  if (!isAuthenticated) {
    return <GameCatalog />;
  }

  // 2. Admin & SuperAdmin View
  if (user?.role === Roles.SuperAdmin || user?.role === Roles.Admin) {
    return <AdminDashboard />;
  }

  // 3. Customer View
  return <CustomerDashboard />;
};
