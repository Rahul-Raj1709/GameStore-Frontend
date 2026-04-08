import { GameCatalog } from "./GameCatalog";
import { useAuth } from "@/features/auth/context/AuthContext";

export const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-linear-to-r from-blue-900/30 to-purple-900/20 border-b border-gray-800 p-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.username}! 🎮
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to discover your next favorite game? Browse the catalog below.
          </p>
        </div>
      </div>

      {/* Render the standard catalog below the banner */}
      <GameCatalog />
    </div>
  );
};
