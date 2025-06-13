import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MyCollection = () => {
  const { token } = useAuth();
  const [likedGames, setLikedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedGames = async () => {
    try {
      const res = await axios.get("/me/likes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLikedGames(res.data);
    } catch (err) {
      console.error("Failed to fetch liked games:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`/games/${id}/like`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Game removed from your collection.");
      setLikedGames((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to remove game:", err);
      toast.error("Failed to remove game from collection.");
    }
  };

  useEffect(() => {
    fetchLikedGames();
  }, []);

  return (
    <div className="p-6 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">
        🎮 My Game Collection
      </h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : likedGames.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          You haven't liked any games yet. Go explore the{" "}
          <Link to="/games" className="text-blue-500 underline">
            Games
          </Link>{" "}
          section!
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {likedGames.map((game) => (
            <div
              key={game.id}
              className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">{game.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Genre:{" "}
                  <span className="font-medium">
                    {game.genre?.name || "N/A"}
                  </span>
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

                <button
                  onClick={() => handleRemove(game.id)}
                  className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                >
                  💔 Remove from Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCollection;
