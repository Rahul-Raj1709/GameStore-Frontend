import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../api/users.service";
import { GameCard } from "@/features/games/components/GameCard";
import {
  Loader2,
  Plus,
  Trash2,
  FolderHeart,
  Heart,
  List as ListIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

export const MyListsPage = () => {
  const [activeTab, setActiveTab] = useState<"liked" | "custom">("liked");
  const [newListName, setNewListName] = useState("");
  const queryClient = useQueryClient();

  const { data: likedGames, isLoading: loadingLiked } = useQuery({
    queryKey: ["likedGames"],
    queryFn: () => usersService.getLikedGames(),
  });

  const { data: customLists, isLoading: loadingLists } = useQuery({
    queryKey: ["customLists"],
    queryFn: () => usersService.getCustomLists(),
  });

  const createListMutation = useMutation({
    mutationFn: (name: string) => usersService.createCustomList(name),
    onSuccess: () => {
      setNewListName("");
      queryClient.invalidateQueries({ queryKey: ["customLists"] });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: number) => usersService.deleteCustomList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customLists"] });
    },
  });

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createListMutation.mutate(newListName.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-3 mb-8">
        <FolderHeart className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-white">My Collections</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800 mb-8 pb-4">
        <button
          onClick={() => setActiveTab("liked")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "liked"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}>
          <Heart className="w-4 h-4" /> Liked Games
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "custom"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}>
          <ListIcon className="w-4 h-4" /> Custom Lists
        </button>
      </div>

      {/* Liked Games Tab */}
      {activeTab === "liked" && (
        <div>
          {loadingLiked ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : likedGames?.length === 0 ? (
            <p className="text-gray-400 italic">
              You haven't liked any games yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {likedGames?.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Lists Tab */}
      {activeTab === "custom" && (
        <div className="space-y-8">
          <form onSubmit={handleCreateList} className="flex gap-3 max-w-md">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New List Name..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={createListMutation.isPending || !newListName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create
            </button>
          </form>

          {loadingLists ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : customLists?.length === 0 ? (
            <p className="text-gray-400 italic">
              You haven't created any custom lists yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {customLists?.map((list) => (
                <div
                  key={list.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {list.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {list.gameCount} {list.gameCount === 1 ? "Game" : "Games"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/my-lists/${list.id}`}
                      className="flex-1 text-center py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                      View List
                    </Link>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${list.name}"?`,
                          )
                        ) {
                          deleteListMutation.mutate(list.id);
                        }
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
