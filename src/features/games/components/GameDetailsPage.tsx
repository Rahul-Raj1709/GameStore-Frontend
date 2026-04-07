import { useParams, Link, useNavigate } from "react-router-dom"; // Add useNavigate
import { useGameDetails } from "../api/useGameDetails";
import {
  ArrowLeft,
  Loader2,
  Heart,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2,
} from "lucide-react"; // Add Edit and Trash2 icons
import { useGamePermissions } from "@/components/RoleGuard"; // Import the permission hook

export const GameDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: game, isLoading, isError } = useGameDetails(Number(id));

  // Check if the current user has permission to manage THIS specific game
  const { canManage } = useGamePermissions(game?.ownerName);

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
        {/* Left Column - Image & Actions */}
        <div className="md:col-span-1 space-y-4">
          {" "}
          {/* Changed space-y-6 to space-y-4 */}
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
          {/* Conditional Admin Actions */}
          {canManage && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigate(`/games/${game.id}/edit`)}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-medium transition-colors border border-blue-500/30">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl font-medium transition-colors border border-red-500/30">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {game.name}
            </h1>
            <div className="flex flex-col items-center justify-center p-3 bg-gray-900 rounded-xl border border-gray-800 min-w-20">
              <Heart className="w-6 h-6 text-pink-500 mb-1" />
              <span className="text-sm font-bold text-gray-300">
                {game.totalLikes}
              </span>
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

          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-white mb-3">
              About this game
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              {game.description || "No description provided for this game."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
