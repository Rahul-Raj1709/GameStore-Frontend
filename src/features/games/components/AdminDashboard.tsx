import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { gamesService } from "../api/games.service";
import { GameSummary } from "../types";
import {
  Edit,
  Trash2,
  Plus,
  ExternalLink,
  Loader2,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === Roles.SuperAdmin;
  const isAdmin = user?.role === Roles.Admin;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || (isSuperAdmin ? "all" : "my");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  const [games, setGames] = useState<GameSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    fetchGames();
  }, [activeTab, page]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      if (activeTab === "my" || isAdmin) {
        const res = await gamesService.getMyGames(page, pageSize);
        setGames(res.items);
        setTotalPages(Math.ceil(res.totalCount / pageSize));
      } else {
        const res = await gamesService.getGames({ page, pageSize });
        setGames(res.items);
        setTotalPages(Math.ceil(res.totalCount / pageSize));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useGSAP(() => {
    if (!loading && games.length > 0) {
      gsap.fromTo(
        "tr.table-row-anim",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [loading, games]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await gamesService.deleteGame(id);
    fetchGames();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6">
      {/* Futuristic Greeting Card */}
      <div className="relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300 tracking-tight">
              {isSuperAdmin
                ? `Welcome, Super Admin ${user?.username}`
                : `Welcome, Admin ${user?.username}`}
            </h1>
            <p className="text-gray-400 mt-2 font-medium text-lg">
              {isSuperAdmin
                ? "Complete system overview and management hub."
                : "Manage and track your published game inventory."}
            </p>
          </div>
          <button
            onClick={() => navigate("/games/new")}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> Add New Game
          </button>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSearchParams({ tab: "all", page: "1" })}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "all" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "bg-gray-900/50 text-gray-400 border border-gray-800 hover:bg-gray-800"}`}>
            System Catalog
          </button>
          <button
            onClick={() => setSearchParams({ tab: "my", page: "1" })}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "my" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "bg-gray-900/50 text-gray-400 border border-gray-800 hover:bg-gray-800"}`}>
            My Contributions
          </button>
        </div>
      )}

      <div className="bg-gray-900/40 rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="p-20 flex flex-col items-center text-gray-500">
            <Gamepad2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">No titles found in this view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" ref={tableRef}>
              <thead className="bg-gray-950/80 text-gray-400 uppercase text-xs font-black tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-5">Title</th>
                  <th className="p-5">Genre</th>
                  <th className="p-5">Release Date</th>
                  <th className="p-5">Price</th>
                  <th className="p-5 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {games.map((g) => (
                  <tr
                    key={g.id}
                    className="table-row-anim hover:bg-white/2 transition-colors group">
                    <td className="p-5 font-bold text-white text-base">
                      {g.name}
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/20">
                        {g.genre}
                      </span>
                    </td>
                    <td className="p-5 text-gray-400 font-medium">
                      {new Date(g.releaseDate).toLocaleDateString()}
                    </td>
                    <td className="p-5 font-bold text-emerald-400">
                      {g.price ? `$${g.price.toFixed(2)}` : "FREE"}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/games/${g.id}`}
                          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                          title="View Store Page">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/games/${g.id}/edit`}
                          className="p-2 bg-blue-900/30 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors border border-blue-500/20"
                          title="Edit Game">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(g.id, g.name)}
                          className="p-2 bg-red-900/30 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-500/20"
                          title="Delete Game">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination (Simplified visually) */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() =>
                setSearchParams({ tab: activeTab, page: (i + 1).toString() })
              }
              className={`w-10 h-10 rounded-xl font-bold transition-all ${i + 1 === page ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
