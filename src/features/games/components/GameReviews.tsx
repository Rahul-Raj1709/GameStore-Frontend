import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesService } from "../api/games.service";
import {
  Star,
  MessageSquare,
  Loader2,
  Trash2,
  Edit3,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Roles } from "@/types";

interface GameReviewsProps {
  gameId: number;
  gameOwnerName: string;
}

export const GameReviews = ({ gameId, gameOwnerName }: GameReviewsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const listRef = useRef<HTMLDivElement>(null);

  const isCustomer = user?.role === Roles.Customer;
  const isSuperAdmin = user?.role === Roles.SuperAdmin;
  const isGameOwner =
    user?.role === Roles.Admin && user?.username === gameOwnerName;

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", gameId, page],
    queryFn: () => gamesService.getReviews(gameId, page, pageSize),
  });

  useGSAP(() => {
    if (reviewsData?.items.length) {
      gsap.fromTo(
        gsap.utils.toArray(".review-item"),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [reviewsData]);

  const reviewMutation = useMutation({
    mutationFn: () => gamesService.addReview(gameId, { rating, comment }),
    onSuccess: () => {
      setComment("");
      setRating(5);
      setPage(1);
      setApiError(null);
      queryClient.invalidateQueries({ queryKey: ["reviews", gameId] });
    },
    onError: (error: any) => {
      const problemDetails = error.response?.data;
      if (
        problemDetails?.title === "Review.Duplicate" ||
        problemDetails?.detail
      ) {
        setApiError(problemDetails.detail);
      } else {
        setApiError("Failed to submit data log. Please try again.");
      }
    },
  });

  // UPDATED: Removed gameId argument to match updated service
  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => gamesService.deleteReview(reviewId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reviews", gameId] }),
  });

  // UPDATED: Removed gameId argument to match updated service
  const updateMutation = useMutation({
    mutationFn: (reviewId: number) =>
      gamesService.updateReview(reviewId, {
        rating: editRating,
        comment: editComment,
      }),
    onSuccess: () => {
      setEditingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ["reviews", gameId] });
    },
  });

  const startEditing = (review: any) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  return (
    <div className="mt-12 border-t border-gray-800/50 pt-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-white">System Data Logs</h3>
      </div>

      {/* Write Review Form - Customers Only */}
      {isCustomer && (
        <div className="bg-gray-900/40 border border-blue-500/20 rounded-2xl p-6 mb-10 shadow-[0_0_30px_rgba(59,130,246,0.05)] backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          <h4 className="text-lg font-bold text-white mb-4">
            Share Your Experience
          </h4>

          {apiError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start gap-2 text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{apiError}</p>
            </div>
          )}

          <div className="flex gap-1.5 mb-4 bg-gray-950/50 w-fit p-2 rounded-xl border border-gray-800/50">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRating(star);
                  setApiError(null);
                }}
                type="button"
                className="hover:scale-110 transition-transform">
                <Star
                  className={`w-7 h-7 ${star <= rating ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-gray-700"}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setApiError(null);
            }}
            placeholder="Did you enjoy the simulation? Let others know..."
            className="w-full bg-gray-950/50 border border-gray-800/50 rounded-xl p-4 text-white mb-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              onClick={() => {
                setApiError(null);
                reviewMutation.mutate();
              }}
              disabled={reviewMutation.isPending || !comment.trim()}
              className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] tracking-wide">
              {reviewMutation.isPending ? "Syncing..." : "Post Review"}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div ref={listRef} className="space-y-4">
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : reviewsData?.items.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
            <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-bold">
              No data logs found.
            </p>
          </div>
        ) : (
          <>
            {reviewsData?.items.map((review) => {
              const isReviewAuthor = user?.username === review.username;
              const canEdit = isReviewAuthor;
              const canDelete = isReviewAuthor || isSuperAdmin || isGameOwner;
              const isEditing = editingReviewId === review.id;

              return (
                <div
                  key={review.id}
                  className="review-item bg-gray-900/30 border border-gray-800/50 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start gap-4 backdrop-blur-sm hover:bg-gray-900/50 hover:border-gray-700 transition-all group">
                  {isEditing ? (
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-bold text-blue-400">
                          Modifying Log
                        </span>
                        <div className="flex gap-1 bg-gray-950 p-1.5 rounded-lg border border-gray-800">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setEditRating(star)}
                              type="button">
                              <Star
                                className={`w-5 h-5 ${star <= editRating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-800 rounded-xl p-3 text-white mb-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingReviewId(null)}
                          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-wider flex items-center gap-1">
                          <X size={14} /> Cancel
                        </button>
                        <button
                          onClick={() => updateMutation.mutate(review.id)}
                          disabled={
                            updateMutation.isPending || !editComment.trim()
                          }
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                          {updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check size={14} /> Save
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-white">
                            {review.username}
                          </span>
                          {isGameOwner && review.username === gameOwnerName && (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] uppercase font-black rounded border border-blue-500/20">
                              Creator
                            </span>
                          )}
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                          <button
                            onClick={() => startEditing(review)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg transition-colors border border-gray-700 hover:border-gray-600"
                            title="Edit Review">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Purge this data log permanently?",
                                )
                              )
                                deleteMutation.mutate(review.id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-2 bg-red-900/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-500/10 hover:border-red-500/30"
                            title="Delete Review">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {reviewsData && reviewsData.totalCount > pageSize && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-800/50">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  Logs {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, reviewsData.totalCount)} of{" "}
                  {reviewsData.totalCount}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 p-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:hover:bg-gray-900 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!reviewsData.hasNextPage}
                    className="flex items-center gap-1 p-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:hover:bg-gray-900 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
