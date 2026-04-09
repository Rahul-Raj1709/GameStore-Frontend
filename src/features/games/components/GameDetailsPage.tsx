import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameDetails } from "../api/useGameDetails";
import { gamesService } from "../api/games.service";
import { usersService } from "@/features/users/api/users.service";
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
  Plus, // <-- Added Plus icon
} from "lucide-react";
import { useGamePermissions } from "@/components/RoleGuard";
import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";

export const GameDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const gameId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Needed to prevent fetching likes/lists if not logged in

  const { data: game, isLoading, isError } = useGameDetails(gameId);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Lists & Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState(false); // <-- Dropdown state

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

  const { data: customLists } = useQuery({
    queryKey: ["customLists"],
    queryFn: () => usersService.getCustomLists(),
    enabled: !!user,
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
      setIsListMenuOpen(false); // Close dropdown on success
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center mt-20">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Game not found</h2>
        <Link
          to="/"
          className="text-blue-400 hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <Link
        to="/"
        className="text-gray-400 hover:text-white mb-8 inline-flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1 space-y-4">
          <div className="aspect-3/4 w-full bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
            {game.imageUrl ? (
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-600 font-medium">
                No Image Available
              </div>
            )}
          </div>

          <button className="w-full py-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg transition-colors border border-gray-700 shadow-lg">
            {game.price !== null
              ? `Buy for $${game.price.toFixed(2)}`
              : "Play for Free"}
          </button>

          {canManage && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigate(`/games/${game.id}/edit`)}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-medium transition-colors border border-blue-500/30">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center justify-center gap-2 py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl font-medium transition-colors border border-red-500/30">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex justify-between items-start mb-4 relative">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {game.name}
            </h1>

            <div className="flex gap-3">
              {/* Add to List Dropdown */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsListMenuOpen(!isListMenuOpen)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 transition-colors text-gray-300 min-w-20">
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-sm font-bold">Save</span>
                  </button>

                  {isListMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-800">
                        <h4 className="text-sm font-bold text-white">
                          Save to List
                        </h4>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {customLists?.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-500">
                            No lists available.
                          </p>
                        ) : (
                          customLists?.map((list) => (
                            <button
                              key={list.id}
                              onClick={() =>
                                toggleGameInListMutation.mutate(list.id)
                              }
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                              {list.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamically Styled Like Button */}
              <button
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-20 transition-all duration-200 disabled:opacity-50 ${
                  isLiked
                    ? "bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20"
                    : "bg-gray-900 border-gray-800 hover:bg-gray-800"
                }`}>
                <Heart
                  className={`w-6 h-6 mb-1 transition-colors ${
                    likeMutation.isPending
                      ? "text-gray-500"
                      : isLiked
                        ? "text-pink-500 fill-pink-500"
                        : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-sm font-bold ${isLiked ? "text-pink-400" : "text-gray-300"}`}>
                  {game.totalLikes}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full font-medium border border-blue-500/20">
              <Tag className="w-4 h-4" /> {game.genre}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full font-medium">
              <Calendar className="w-4 h-4" />{" "}
              {new Date(game.releaseDate).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full font-medium">
              <User className="w-4 h-4" /> Added by {game.ownerName}
            </span>
          </div>

          <div className="prose prose-invert max-w-none mb-10">
            <h3 className="text-xl font-semibold text-white mb-3">
              About this game
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {game.description || "No description provided."}
            </p>
          </div>

          {/* --- Reviews Section --- */}
          <div className="border-t border-gray-800 pt-8 mt-8">
            <h3 className="text-2xl font-bold text-white mb-6">Reviews</h3>

            {/* Add Review Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
              <h4 className="text-lg font-medium text-white mb-3">
                Leave a Review
              </h4>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    type="button">
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think about the game?"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-3 focus:outline-none focus:border-blue-500"
                rows={3}
              />
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending || !comment.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </button>
            </div>

            {/* Reviews List */}
            {isLoadingReviews ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
            ) : reviewsData?.items.length === 0 ? (
              <p className="text-gray-500 italic">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {reviewsData?.items.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-white">
                          {review.username}
                        </span>
                        <div className="flex gap-1">
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
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                    {canManage && (
                      <button
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Delete Confirmation Modal --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl scale-in-center">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Delete Game?</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">"{game.name}"</span>?
              This action is permanent and cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDeleteGame}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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
