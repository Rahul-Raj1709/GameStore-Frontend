import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gamesService } from "../api/games.service";
import { genresService } from "../api/genres.service";
import { Genre, CreateGamePayload } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";

export const AddGamePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Game Form State ---
  const [formData, setFormData] = useState<CreateGamePayload>({
    name: "",
    description: "",
    imageUrl: "",
    genreId: 0,
    price: null,
    releaseDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Genres State ---
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);

  // --- Add Genre Modal State ---
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [isAddingGenre, setIsAddingGenre] = useState(false);
  const [genreError, setGenreError] = useState<string | null>(null);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const data = await genresService.getGenres();
      setGenres(data);
    } catch (err) {
      console.error("Failed to fetch genres", err);
    } finally {
      setIsLoadingGenres(false);
    }
  };

  // --- Handlers ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "genreId" || name === "price"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.genreId === 0) {
      setError("Please select a genre.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const cleanPayload = {
        ...formData,
        imageUrl: formData.imageUrl?.trim() || null,
      };

      const result = await gamesService.createGame(cleanPayload);
      navigate(`/games/${result.id}`); // Redirect to the newly created game
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to create game. Please check your inputs.",
      );
      setIsSubmitting(false);
    }
  };

  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) return;
    setIsAddingGenre(true);
    setGenreError(null);

    try {
      const result = await genresService.createGenre(newGenreName.trim());
      // Refresh the dropdown and select the newly created genre automatically
      await fetchGenres();
      setFormData((prev) => ({ ...prev, genreId: result.id }));
      setIsGenreModalOpen(false);
      setNewGenreName("");
    } catch (err: any) {
      // Show backend validation error (e.g., Duplicate)
      setGenreError(err.response?.data?.detail || "Failed to add genre.");
    } finally {
      setIsAddingGenre(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl relative">
        <h1 className="text-3xl font-bold text-white mb-6">Add New Game</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-800 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Game Title *
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. The Legend of Zelda"
              />
            </div>

            {/* Genre */}
            <div className="col-span-1">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-gray-400">
                  Genre *
                </label>
                {user?.role === Roles.SuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsGenreModalOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    + Add New
                  </button>
                )}
              </div>
              <select
                required
                name="genreId"
                value={formData.genreId || ""}
                onChange={handleChange}
                disabled={isLoadingGenres}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50">
                <option value="" disabled>
                  Select a genre...
                </option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Date */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Release Date *
              </label>
              <input
                required
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all scheme:dark"
              />
            </div>

            {/* Price */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Cover Image URL (Optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl || ""}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="https://..."
              />
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description *
              </label>
              <textarea
                required
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                placeholder="Tell players about the game..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 text-gray-400 hover:text-white mr-4 transition-colors font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {isSubmitting ? "Creating..." : "Add Game"}
            </button>
          </div>
        </form>
      </div>

      {/* --- Inline Add Genre Modal --- */}
      {isGenreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New Genre</h2>

            {genreError && (
              <div className="mb-4 text-sm text-red-400 bg-red-900/30 p-2 rounded">
                {genreError}
              </div>
            )}

            <input
              type="text"
              value={newGenreName}
              onChange={(e) => setNewGenreName(e.target.value)}
              placeholder="e.g. Battle Royale"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-6"
              autoFocus
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsGenreModalOpen(false);
                  setGenreError(null);
                  setNewGenreName("");
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreateGenre}
                disabled={isAddingGenre || !newGenreName.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                {isAddingGenre ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
