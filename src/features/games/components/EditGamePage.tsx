import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gamesService } from "../api/games.service";
import { genresService } from "../api/genres.service";
import { Genre, CreateGamePayload } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Edit3, Loader2 } from "lucide-react";

export const EditGamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

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
  const [genres, setGenres] = useState<Genre[]>([]);

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
          releaseDate: game.releaseDate.split("T")[0],
        });
      } catch (err) {
        alert("Failed to load game details.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  useGSAP(() => {
    if (!isLoading) {
      gsap.fromTo(
        ".form-element",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" },
      );
    }
  }, [isLoading]);

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
    try {
      await gamesService.updateGame(Number(id), formData);
      navigate(`/games/${id}`);
    } catch (err) {
      alert("Failed to update game.");
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10" ref={formRef}>
      <div className="relative bg-gray-950/60 backdrop-blur-2xl border border-gray-800 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 mb-10 form-element">
          <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Edit3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Modify Registry
            </h1>
            <p className="text-blue-400 font-medium">
              Update existing system parameters
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-1 md:col-span-2 form-element">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Game Designation
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-lg placeholder:text-gray-700 shadow-inner"
              />
            </div>

            <div className="col-span-1 form-element">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Classification (Genre)
              </label>
              <select
                required
                name="genreId"
                value={formData.genreId}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none">
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1 form-element">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Launch Protocol (Date)
              </label>
              <input
                required
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium scheme:dark"
              />
            </div>

            <div className="col-span-1 form-element">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Exchange Rate (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-blue-500 font-black">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl p-4 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                />
              </div>
            </div>

            <div className="col-span-1 form-element">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Visual Asset (URL)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              />
            </div>

            <div className="col-span-1 md:col-span-2 form-element">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                System Description
              </label>
              <textarea
                required
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none font-medium leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-8 mt-4 border-t border-gray-800/50 form-element">
            <button
              type="button"
              onClick={() => navigate(`/games/${id}`)}
              className="px-8 py-4 text-gray-400 hover:text-white mr-4 transition-colors font-bold uppercase tracking-wider text-sm">
              Abort
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              {isSubmitting ? "Syncing..." : "Commit Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
