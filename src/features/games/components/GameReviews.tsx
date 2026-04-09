import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesService } from "../api/games.service";
import { Star, MessageSquare, Loader2, Trash2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const GameReviews = ({ gameId }: { gameId: number }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const listRef = useRef<HTMLDivElement>(null);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", gameId],
    queryFn: () => gamesService.getReviews(gameId, 1, 10),
  });

  useGSAP(() => {
    if (reviewsData?.items.length) {
      gsap.fromTo(
        gsap.utils.toArray(".review-item"),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" },
      );
    }
  }, [reviewsData]);

  const reviewMutation = useMutation({
    mutationFn: () => gamesService.addReview(gameId, { rating, comment }),
    onSuccess: () => {
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", gameId] });
    },
  });

  return (
    <div className="mt-12 border-t border-gray-800/50 pt-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-white">Player Reviews</h3>
      </div>

      {/* Review Form */}
      <div className="bg-gray-900/40 border border-blue-500/20 rounded-2xl p-6 mb-10 shadow-[0_0_30px_rgba(59,130,246,0.05)] backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
        <h4 className="text-lg font-bold text-white mb-4">
          Share Your Experience
        </h4>
        <div className="flex gap-1.5 mb-4 bg-gray-950/50 w-fit p-2 rounded-xl border border-gray-800/50">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
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
          onChange={(e) => setComment(e.target.value)}
          placeholder="Did you enjoy the game? Let others know..."
          className="w-full bg-gray-950/50 border border-gray-800/50 rounded-xl p-4 text-white mb-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            onClick={() => reviewMutation.mutate()}
            disabled={reviewMutation.isPending || !comment.trim()}
            className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {reviewMutation.isPending ? "Posting..." : "Post Review"}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div ref={listRef} className="space-y-4">
        {isLoading ? (
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
          reviewsData?.items.map((review) => (
            <div
              key={review.id}
              className="review-item bg-gray-900/30 border border-gray-800/50 rounded-2xl p-6 flex justify-between items-start backdrop-blur-sm hover:bg-gray-900/50 hover:border-gray-700 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-white">
                    {review.username}
                  </span>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};
