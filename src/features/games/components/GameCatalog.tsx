import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useGames } from "../api/useGames";
import { GameCard } from "./GameCard";
import { Loader2, AlertCircle, Search, SlidersHorizontal } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useDebounce } from "@/hooks/useDebounce";

export const GameCatalog = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [desc, setDesc] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGames({
    pageSize: 12,
    search: debouncedSearch || undefined,
    sortBy: sortBy || undefined,
    desc,
  });

  const games = data?.pages.flatMap((page) => page.items) || [];

  // GSAP Animations
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (games.length > 0) {
      gsap.fromTo(
        ".game-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" },
      );
    }
  }, [games.length]);

  return (
    <div className="max-w-7xl mx-auto p-6" ref={containerRef}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Browse Games</h1>
          <p className="text-gray-400">Discover your next favorite title.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative grow md:grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={`${sortBy}-${desc}`}
              onChange={(e) => {
                const [newSort, newDesc] = e.target.value.split("-");
                setSortBy(newSort);
                setDesc(newDesc === "true");
              }}
              className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer">
              <option value="-false">Sort By...</option>
              <option value="price-false">Price: Low to High</option>
              <option value="price-true">Price: High to Low</option>
              <option value="name-false">Name: A to Z</option>
              <option value="releaseDate-true">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {isError && (
        <div className="p-4 mb-6 rounded-lg bg-red-900/50 border border-red-500/50 text-red-200 flex gap-3 max-w-lg">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>Failed to load the catalog. Please try again later.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <Link
            to={`/games/${game.id}`}
            key={game.id}
            className="game-card opacity-0">
            <GameCard game={game} />
          </Link>
        ))}
      </div>

      {isLoading && games.length === 0 && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {!isLoading && games.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No games found matching your criteria.
        </div>
      )}

      {hasNextPage && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
            {isFetchingNextPage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : null}
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};
