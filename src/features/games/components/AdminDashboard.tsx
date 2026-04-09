import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { gamesService } from "../api/games.service";
import { GameSummary } from "../types";
import {
  Edit,
  Trash2,
  Plus,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === Roles.SuperAdmin;

  const [searchParams, setSearchParams] = useSearchParams();

  // URL synced state
  const activeTab = searchParams.get("tab") || (isSuperAdmin ? "all" : "my");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  const [games, setGames] = useState<GameSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, [activeTab, page]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      if (activeTab === "my") {
        const res = await gamesService.getMyGames(page, pageSize);
        setGames(res.items);
        setTotalPages(Math.ceil(res.totalCount / pageSize));
      } else {
        const res = await gamesService.getGames({ page, pageSize });
        setGames(res.items);
        setTotalPages(Math.ceil(res.totalCount / pageSize));
      }
    } catch (err) {
      console.error("Failed to fetch games for dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab, page: "1" }); // Reset to page 1 on tab change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ tab: activeTab, page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await gamesService.deleteGame(id);
      fetchGames(); // Refetch to maintain accurate pagination pages
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

      {isSuperAdmin && (
        <div className="flex space-x-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => handleTabChange("all")}
            className={`pb-3 px-4 font-medium transition-colors ${activeTab === "all" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-200"}`}>
            All Games
          </button>
          <button
            onClick={() => handleTabChange("my")}
            className={`pb-3 px-4 font-medium transition-colors ${activeTab === "my" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-200"}`}>
            My Published Games
          </button>
        </div>
      )}

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
            {/* Keeping existing table body rendering... */}
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

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${pageNum === page ? "bg-blue-600 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
