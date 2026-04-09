import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "../api/users.service";
import { GameCard } from "@/features/games/components/GameCard";
import { ArrowLeft, Loader2, List as ListIcon } from "lucide-react";

export const CustomListDetailsPage = () => {
  const { listId } = useParams<{ listId: string }>();
  const id = Number(listId);

  const {
    data: list,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customList", id],
    queryFn: () => usersService.getCustomListById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !list) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center mt-20">
        <h2 className="text-2xl font-bold text-red-400 mb-4">List not found</h2>
        <Link
          to="/my-lists"
          className="text-blue-400 hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to My Lists
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <Link
        to="/my-lists"
        className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Collections
      </Link>

      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-800">
        <ListIcon className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">{list.name}</h1>
          <p className="text-gray-400">
            {list.games.length} {list.games.length === 1 ? "Game" : "Games"}
          </p>
        </div>
      </div>

      {list.games.length === 0 ? (
        <p className="text-gray-400 italic">
          There are no games in this list yet. Go browse the catalog to add
          some!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};
