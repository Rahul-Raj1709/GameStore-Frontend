import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gamesService } from "../api/games.service";
import { genresService } from "../api/genres.service";
import { Genre, CreateGamePayload } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";

export const EditGamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateGamePayload>({
    name: "",
    description: "",
    imageUrl: "",
    genreId: 0,
    price: null,
    releaseDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [isAddingGenre, setIsAddingGenre] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [game, genreList] = await Promise.all([
          gamesService.getGameById(Number(id)),
          genresService.getGenres(),
        ]);

        setGenres(genreList);
        setFormData({
          name: game.name,
          description: game.description,
          imageUrl: game.imageUrl || "",
          genreId: game.genreId,
          price: game.price,
          releaseDate: game.releaseDate.split("T")[0], // Extract YYYY-MM-DD
        });
      } catch (err) {
        setError("Failed to load game details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

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
    setIsSubmitting(true);
    setError(null);

    try {
      await gamesService.updateGame(Number(id), formData);
      navigate(`/games/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update game.");
      setIsSubmitting(false);
    }
  };

  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) return;
    setIsAddingGenre(true);
    try {
      const result = await genresService.createGenre(newGenreName.trim());
      const updatedGenres = await genresService.getGenres();
      setGenres(updatedGenres);
      setFormData((prev) => ({ ...prev, genreId: result.id }));
      setIsGenreModalOpen(false);
      setNewGenreName("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add genre.");
    } finally {
      setIsAddingGenre(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-400">
        Loading game details...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6">Edit Game</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Game Title *
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
              />
            </div>

            <div className="col-span-1">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-gray-400">
                  Genre *
                </label>
                {user?.role === Roles.SuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsGenreModalOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300">
                    + Add New
                  </button>
                )}
              </div>
              <select
                required
                name="genreId"
                value={formData.genreId}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3">
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

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
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 scheme:dark"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description *
              </label>
              <textarea
                required
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => navigate(`/games/${id}`)}
              className="px-6 py-3 text-gray-400 hover:text-white mr-4">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Genre Modal Logic (Same as AddGamePage) */}
      {isGenreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New Genre</h2>
            <input
              type="text"
              value={newGenreName}
              onChange={(e) => setNewGenreName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 mb-6"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsGenreModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateGenre}
                disabled={isAddingGenre}
                className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
