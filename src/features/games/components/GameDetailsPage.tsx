import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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
  X,
  Star,
  Plus,
  Gamepad2,
  MessageSquare,
} from "lucide-react";
import { useGamePermissions } from "@/components/RoleGuard";
import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";

export const GameDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const gameId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Dynamic Back Button Logic based on passed state
  const from = location.state?.from || "Catalog";
  const listName = location.state?.listName || "";

  let backText = "Back to Catalog";
  if (from === "LikedGames") backText = "Back to Liked Games";
  if (from === "CustomList") backText = `Back to ${listName}`;

  const { data: game, isLoading, isError } = useGameDetails(gameId);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Lists & Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);

  const { canManage } = useGamePermissions(game?.ownerName);

  // Queries
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", gameId],
    queryFn: () => gamesService.getReviews(gameId, 1, 10),
    enabled: !!gameId,
  });

  const { data: likedGames } = useQuery({
    queryKey: ["likedGames"],
    queryFn: () => usersService.getLikedGames(),
    enabled: !!user,
  });

  const { data: customLists, isLoading: isLoadingLists } = useQuery({
    queryKey: ["customLists"],
    queryFn: () => usersService.getCustomLists(),
    enabled: !!user && user.role === Roles.Customer,
  });

  const isLiked = likedGames?.some((g) => g.id === gameId) ?? false;

  // Mutations
  const likeMutation = useMutation({
    mutationFn: () => gamesService.toggleLike(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedGames"] });
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => gamesService.addReview(gameId, { rating, comment }),
    onSuccess: () => {
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", gameId] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => gamesService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", gameId] });
    },
  });

  const toggleGameInListMutation = useMutation({
    mutationFn: (listId: number) =>
      usersService.toggleGameInList(listId, gameId),
    onSuccess: (data, listId) => {
      queryClient.invalidateQueries({ queryKey: ["customList", listId] });
      queryClient.invalidateQueries({ queryKey: ["customLists"] });
      setIsListMenuOpen(false);
    },
  });

  const handleDeleteGame = async () => {
    if (!game) return;
    setIsDeleting(true);
    try {
      await gamesService.deleteGame(game.id);
      navigate("/");
    } catch (err) {
      alert("Failed to delete the game. Please try again.");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center mt-32">
        <Gamepad2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Game not found</h2>
        <p className="text-gray-400 mb-8">
          The title you are looking for does not exist or was removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Return to Safety
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Immersive Header Banner (Blur Effect) */}
      <div className="relative h-72 lg:h-96 w-full overflow-hidden">
        {game.imageUrl ? (
          <>
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img
              src={game.imageUrl}
              alt=""
              className="w-full h-full object-cover blur-md scale-110 opacity-50"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-gray-900 to-blue-950 z-10" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/80 to-transparent z-20" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 -mt-56 lg:-mt-64 relative z-30">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8 w-fit cursor-pointer group bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-black/60">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm tracking-wide">{backText}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Poster & Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="aspect-[3/4] w-full bg-gray-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 group">
              {game.imageUrl ? (
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-600">
                  <Gamepad2 className="w-16 h-16 mb-2 opacity-50" />
                  <span className="font-medium">No Image</span>
                </div>
              )}
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 p-6 rounded-2xl shadow-xl">
              <button className="w-full py-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl transition-all shadow-lg shadow-blue-900/30 mb-4 hover:-translate-y-0.5">
                {game.price !== null && game.price > 0
                  ? `Buy for $${game.price.toFixed(2)}`
                  : "Play for Free"}
              </button>

              {canManage && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800/50">
                  <button
                    onClick={() => navigate(`/games/${game.id}/edit`)}
                    className="flex items-center justify-center gap-2 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-medium transition-colors border border-white/5">
                    <Edit className="w-4 h-4 text-blue-400" /> Edit
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl font-medium transition-colors border border-red-500/20">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Reviews */}
          <div className="lg:col-span-8 pt-2 lg:pt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-4 shadow-black drop-shadow-md">
                  {game.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-500/20 text-blue-300 text-sm rounded-lg font-bold border border-blue-500/30 uppercase tracking-wider backdrop-blur-sm">
                    <Tag className="w-4 h-4" /> {game.genre}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 text-gray-200 text-sm rounded-lg font-medium backdrop-blur-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(game.releaseDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Interaction Buttons (Save & Like) */}
              <div className="flex gap-3 bg-gray-900/60 backdrop-blur-md p-2 rounded-2xl border border-gray-800">
                {user?.role === Roles.Customer && (
                  <div className="relative">
                    <button
                      onClick={() => setIsListMenuOpen(!isListMenuOpen)}
                      className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white/10 transition-colors text-gray-300 group">
                      <Plus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Save
                      </span>
                    </button>

                    {isListMenuOpen && (
                      <div className="absolute right-0 top-full mt-3 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black z-50 overflow-hidden ring-1 ring-white/10">
                        <div className="px-5 py-3 bg-gray-800/50 border-b border-gray-700">
                          <h4 className="text-xs font-black text-gray-300 uppercase tracking-wider">
                            Add to Collection
                          </h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                          {isLoadingLists ? (
                            <div className="px-5 py-4 text-sm text-gray-400 flex items-center gap-3">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />{" "}
                              Fetching lists...
                            </div>
                          ) : !customLists || customLists.length === 0 ? (
                            <p className="px-5 py-4 text-sm text-gray-500 italic">
                              You haven't created any lists yet.
                            </p>
                          ) : (
                            customLists.map((list) => (
                              <button
                                key={list.id}
                                onClick={() =>
                                  toggleGameInListMutation.mutate(list.id)
                                }
                                className="w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between group/item">
                                <span className="font-medium truncate pr-4">
                                  {list.name}
                                </span>
                                <Plus className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {user && (
                  <button
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 disabled:opacity-50 group ${
                      isLiked ? "bg-pink-500/20" : "hover:bg-white/10"
                    }`}>
                    <Heart
                      className={`w-6 h-6 mb-1 transition-all ${
                        likeMutation.isPending
                          ? "text-gray-600"
                          : isLiked
                            ? "text-pink-500 fill-pink-500 scale-110"
                            : "text-gray-400 group-hover:scale-110 group-hover:text-pink-300"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${isLiked ? "text-pink-400" : "text-gray-300"}`}>
                      {game.totalLikes}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 md:p-8 mb-12 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" /> About This
                Game
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg font-medium">
                {game.description ||
                  "The developers have not provided a description for this title."}
              </p>

              <div className="mt-8 pt-6 border-t border-gray-800/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center ring-2 ring-gray-700">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Curated By
                  </p>
                  <p className="text-white font-medium">{game.ownerName}</p>
                </div>
              </div>
            </div>

            {/* --- Reviews Section --- */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-white">
                  Player Reviews
                </h3>
                <div className="flex text-yellow-400 gap-1 opacity-50">
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                </div>
              </div>

              {user && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h4 className="text-lg font-bold text-white mb-4">
                    Share Your Experience
                  </h4>
                  <div className="flex gap-1.5 mb-4 bg-gray-950 w-fit p-2 rounded-xl border border-gray-800">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        type="button"
                        className="hover:scale-110 transition-transform">
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                              : "text-gray-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Did you enjoy the game? Let others know..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => reviewMutation.mutate()}
                      disabled={reviewMutation.isPending || !comment.trim()}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20">
                      {reviewMutation.isPending ? "Posting..." : "Post Review"}
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {isLoadingReviews ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : reviewsData?.items.length === 0 ? (
                <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
                  <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 text-lg">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsData?.items.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 flex justify-between items-start transition-all hover:bg-gray-900 hover:border-gray-700">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                          <span className="font-bold text-white text-lg">
                            {review.username}
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {new Date(review.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                      {canManage && (
                        <button
                          onClick={() => deleteReviewMutation.mutate(review.id)}
                          className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors ml-4 shrink-0">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-sm w-full p-8 shadow-2xl shadow-black scale-in-center">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              Delete Game?
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="text-white font-bold">"{game.name}"</span>? This
              action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDeleteGame}
                disabled={isDeleting}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20">
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
