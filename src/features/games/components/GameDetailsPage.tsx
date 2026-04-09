import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameDetails } from "../api/useGameDetails";
import { gamesService } from "../api/games.service";
import { usersService } from "@/features/users/api/users.service";
import { Roles } from "@/types";
import {
  ArrowLeft,
  Loader2,
  Heart,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Plus,
  Gamepad2,
  MessageSquare,
} from "lucide-react";
import { useGamePermissions } from "@/components/RoleGuard";
import { useState, useRef } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { DeleteGameModal } from "./DeleteGameModal";
import { GameReviews } from "./GameReviews";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const GameDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const gameId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false); // Add ref to track initial animation

  const from = location.state?.from || "Catalog";
  const listName = location.state?.listName || "";
  const backText =
    from === "LikedGames"
      ? "Back to Liked Games"
      : from === "CustomList"
        ? `Back to ${listName}`
        : "Back to Catalog";

  const { data: game, isLoading, isError } = useGameDetails(gameId);
  const { canManage } = useGamePermissions(game?.ownerName);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);

  const isCustomer = user?.role === Roles.Customer;

  useGSAP(() => {
    // Only animate if we have data, it's not loading, and we HAVEN'T animated yet.
    if (game && !isLoading && !hasAnimated.current) {
      hasAnimated.current = true;
      gsap.fromTo(
        ".fade-up",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" },
      );
    }
  }, [game?.id, isLoading]); // Depend on ID, not the whole object, to prevent re-triggering on updates

  const { data: likedGames } = useQuery({
    queryKey: ["likedGames"],
    queryFn: () => usersService.getLikedGames(),
    enabled: isCustomer,
  });

  const { data: customLists, isLoading: isLoadingLists } = useQuery({
    queryKey: ["customLists"],
    queryFn: () => usersService.getCustomLists(),
    enabled: isCustomer,
  });

  const isLiked = likedGames?.some((g) => g.id === gameId) ?? false;

  const likeMutation = useMutation({
    mutationFn: () => gamesService.toggleLike(gameId),
    onSuccess: () => {
      // Invalidate to fetch new like count and status, UI will update seamlessly now without flashing animations
      queryClient.invalidateQueries({ queryKey: ["likedGames"] });
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    },
  });

  const toggleGameInListMutation = useMutation({
    mutationFn: (listId: number) =>
      usersService.toggleGameInList(listId, gameId),
    onSuccess: (_, listId) => {
      queryClient.invalidateQueries({ queryKey: ["customList", listId] });
      setIsListMenuOpen(false);
    },
  });

  const handleDeleteGame = async () => {
    setIsDeleting(true);
    try {
      await gamesService.deleteGame(game!.id);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to delete the game.");
      setIsDeleting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  if (isError || !game)
    return <div className="text-center mt-32 text-white">Game not found</div>;

  return (
    <div className="min-h-screen pb-20" ref={containerRef}>
      {/* Banner */}
      <div className="relative h-72 lg:h-96 w-full overflow-hidden fade-up">
        <div className="absolute inset-0 bg-black/60 z-10" />
        {game.imageUrl && (
          <img
            src={game.imageUrl}
            className="w-full h-full object-cover blur-md scale-110 opacity-50"
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/80 to-transparent z-20" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 -mt-56 lg:-mt-64 relative z-30">
        <button
          onClick={() => navigate(-1)}
          className="fade-up flex items-center gap-2 text-gray-300 hover:text-white mb-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all hover:bg-black/60">
          <ArrowLeft className="w-4 h-4" />{" "}
          <span className="text-sm">{backText}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6 fade-up">
            <div className="aspect-3/4 w-full bg-gray-900 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/10 relative group">
              {game.imageUrl ? (
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                  <Gamepad2 className="w-16 h-16 opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
            </div>

            {/* Price & Actions */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 p-6 rounded-2xl shadow-xl">
              <button className="w-full py-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-transform hover:-translate-y-1 mb-4">
                {game.price ? `$${game.price.toFixed(2)}` : "Free"}
              </button>

              {canManage && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800/50">
                  <button
                    onClick={() => navigate(`/games/${game.id}/edit`)}
                    className="flex justify-center items-center gap-2 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-medium border border-white/5 transition-colors">
                    <Edit className="w-4 h-4 text-blue-400" /> Edit
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex justify-center items-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-medium border border-red-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 pt-2 lg:pt-10 fade-up">
            {/* Added relative z-40 here to establish a higher stacking context for the dropdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6 relative z-40">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
                  {game.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-500/10 text-blue-400 text-sm rounded-lg font-bold border border-blue-500/20 uppercase tracking-wider">
                    <Tag className="w-4 h-4" /> {game.genre}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/5 text-gray-300 text-sm rounded-lg font-medium border border-white/10">
                    <Calendar className="w-4 h-4" />{" "}
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Only Customers see Like/Save */}
              {isCustomer && (
                <div className="flex gap-2 bg-gray-900/40 backdrop-blur-md p-2 rounded-2xl border border-gray-800/50">
                  <div className="relative">
                    <button
                      onClick={() => setIsListMenuOpen(!isListMenuOpen)}
                      className="flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-white/10 transition-colors text-gray-300">
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold uppercase">
                        Save
                      </span>
                    </button>
                    {isListMenuOpen && (
                      <div className="absolute right-0 top-full mt-3 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl z-50 p-2">
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-800 mb-2">
                          Save to List
                        </div>
                        {isLoadingLists ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto my-4 text-blue-500" />
                        ) : (
                          customLists?.map((list) => (
                            <button
                              key={list.id}
                              onClick={() =>
                                toggleGameInListMutation.mutate(list.id)
                              }
                              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg transition-colors truncate">
                              {list.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${isLiked ? "bg-pink-500/10 text-pink-500" : "hover:bg-white/10 text-gray-300"}`}>
                    <Heart
                      className={`w-5 h-5 mb-1 transition-all duration-300 ${isLiked ? "fill-pink-500 scale-110" : ""}`}
                    />
                    <span className="text-[9px] font-bold uppercase">
                      {game.totalLikes}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-900/20 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl fade-up relative z-10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" /> Description
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg font-medium">
                {game.description}
              </p>

              <div className="mt-8 pt-6 border-t border-gray-800/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center ring-2 ring-gray-700/50">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Curated By
                  </p>
                  <p className="text-white font-medium text-lg">
                    {game.ownerName}
                  </p>
                </div>
              </div>
            </div>

            {/* Hide Reviews from Admins completely */}
            {isCustomer && (
              <div className="fade-up relative z-10">
                <GameReviews gameId={game.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteGameModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteGame}
        isDeleting={isDeleting}
        gameName={game.name}
      />
    </div>
  );
};
