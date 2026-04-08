import { useEffect, useState } from "react";
import { gamesService } from "../api/games.service";
import { GameSummary } from "../types";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === Roles.SuperAdmin;

  // SuperAdmins default to 'all', Admins default to 'my'
  const [activeTab, setActiveTab] = useState<"all" | "my">(
    isSuperAdmin ? "all" : "my",
  );
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, [activeTab]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      if (activeTab === "my") {
        const res = await gamesService.getMyGames();
        setGames(res.data);
      } else {
        const res = await gamesService.getGames({ pageSize: 50 }); // Fetch standard catalog for SuperAdmin
        setGames(res.items);
      }
    } catch (err) {
      console.error("Failed to fetch games for dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await gamesService.deleteGame(id);
      setGames(games.filter((g) => g.id !== id));
    } catch (err) {
      alert("Failed to delete game.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Management Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Manage store inventory and game details.
          </p>
        </div>
        <button
          onClick={() => navigate("/games/new")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg">
          <Plus className="w-5 h-5" /> Add New Game
        </button>
      </div>

      {/* SuperAdmin Tabs */}
      {isSuperAdmin && (
        <div className="flex space-x-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "all"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}>
            All Games
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "my"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}>
            My Published Games
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No games found. Start adding some!
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Genre</th>
                <th className="p-4 font-medium">Release Date</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {games.map((g) => (
                <tr
                  key={g.id}
                  className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 font-bold text-white">{g.name}</td>
                  <td className="p-4 text-gray-300">
                    <span className="px-2 py-1 bg-gray-800 rounded-md text-xs">
                      {g.genre}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(g.releaseDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-green-400 font-medium">
                    {g.price ? `$${g.price.toFixed(2)}` : "Free"}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/games/${g.id}`}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="View Store Page">
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/games/${g.id}/edit`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Game">
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(g.id, g.name)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Game">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
