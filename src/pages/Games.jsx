import React, { useEffect, useState } from "react";
import {
  fetchGames,
  fetchGenres,
  createGame,
  updateGame,
  deleteGame,
} from "../api/games";
import { likeGame, unlikeGame, fetchLikedGames } from "../api/likes";
import { useAuth } from "../context/AuthContext";
import GameFormModal from "../components/GameFormModal";
import toast from "react-hot-toast";

const Games = () => {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [genreId, setGenreId] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [gameToEdit, setGameToEdit] = useState(null);

  const { user, token } = useAuth();

  const getGames = async (page = 1) => {
    setLoading(true);
    try {
      const { data, pagination } = await fetchGames({
        search,
        genreId,
        sort: sortOption,
        page,
        pageSize: 6,
      });
      setGames(data);
      setPagination(pagination);
    } catch (err) {
      console.error("Error fetching games:", err);
    }
    setLoading(false);
  };

  const loadLikedGames = async () => {
    try {
      const res = await fetchLikedGames(token);
      setLikedIds(res.map((g) => g.id));
    } catch (err) {
      console.error("Failed to fetch liked games", err);
    }
  };

  useEffect(() => {
    fetchGenres().then(setGenres);
    getGames();
    if (user) loadLikedGames();
  }, []);

  const handleSearch = () => getGames(1);
  const handlePageChange = (page) => getGames(page);

  const handleEdit = (game) => {
    setGameToEdit(game);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this game?")) return;
    try {
      await deleteGame(id);
      getGames();
    } catch (err) {
      console.error("Error deleting game:", err);
    }
  };

  const handleSave = async (formData, gameId) => {
    try {
      const data = {
        ...formData,
        genreId: parseInt(formData.genreId),
      };
      if (gameId) {
        await updateGame(gameId, data);
      } else {
        await createGame(data);
      }
      setShowModal(false);
      setGameToEdit(null);
      getGames();
    } catch (err) {
      console.error("Error saving game:", err);
    }
  };

  const toggleLike = async (gameId) => {
    try {
      if (likedIds.includes(gameId)) {
        await unlikeGame(gameId, token);
        toast.success("Removed from collection");
        setLikedIds((prev) => prev.filter((id) => id !== gameId));
      } else {
        await likeGame(gameId, token);
        toast.success("Added to collection");
        setLikedIds((prev) => [...prev, gameId]);
      }
    } catch (err) {
      toast.error("Failed to update like");
    }
  };

  return (
    <div className="p-6 text-gray-900 dark:text-white">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 w-full sm:w-1/3 bg-white dark:bg-gray-800"
        />
        <select
          value={genreId}
          onChange={(e) => setGenreId(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 w-full sm:w-1/4 bg-white dark:bg-gray-800"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 w-full sm:w-1/4 bg-white dark:bg-gray-800"
        >
          <option value="">Sort By</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="release-new">Release Date (Newest First)</option>
          <option value="release-old">Release Date (Oldest First)</option>
        </select>
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Admin Add Game */}
      {user?.role === "Admin" && (
        <div className="mb-6">
          <button
            onClick={() => {
              setGameToEdit(null);
              setShowModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + Add Game
          </button>
        </div>
      )}

      {/* Game Cards */}
      {loading ? (
        <p>Loading games...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.id}
              className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">{game.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Genre: <span className="font-medium">{game.genre?.name}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Price:{" "}
                  <span className="font-medium">${game.price.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Release:{" "}
                  <span className="font-medium">
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </span>
                </p>

                {user && (
                  <button
                    onClick={() => toggleLike(game.id)}
                    className={`text-sm px-3 py-1 rounded-full ${
                      likedIds.includes(game.id)
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                    }`}
                  >
                    {likedIds.includes(game.id) ? "💔 Unlike" : "❤️ Like"}
                  </button>
                )}

                {user?.role === "Admin" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(game)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDelete(game.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${
                page === pagination.currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-white"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <GameFormModal
          onClose={() => {
            setShowModal(false);
            setGameToEdit(null);
          }}
          onSave={handleSave}
          gameToEdit={gameToEdit}
          genres={genres}
        />
      )}
    </div>
  );
};

export default Games;
