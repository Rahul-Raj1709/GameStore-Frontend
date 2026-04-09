import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGames } from "../api/useGames";
import { GameCard } from "./GameCard";
import {
  Loader2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export const GameCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Derive current state from the URL including genreId
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const desc = searchParams.get("desc") === "true";
  const urlSearch = searchParams.get("search") || "";
  // Extract genreId from URL
  const genreId = searchParams.get("genreId")
    ? parseInt(searchParams.get("genreId")!, 10)
    : undefined;

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 500);

  const pageSize = 12;

  // 2. Fetch data based on ALL URL parameters including genreId
  const { data, isLoading, isError, isFetching } = useGames({
    page,
    pageSize,
    search: urlSearch || undefined,
    sortBy: sortBy || undefined,
    desc,
    genreId, // Pass genreId to the API hook
  });

  const games = data?.items || [];
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  // 3. Sync search input with URL
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearch) newParams.set("search", debouncedSearch);
      else newParams.delete("search");
      newParams.set("page", "1");
      setSearchParams(newParams);
    }
  }, [debouncedSearch, urlSearch, searchParams, setSearchParams]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newDesc] = e.target.value.split("-");
    const newParams = new URLSearchParams(searchParams);
    if (newSort) newParams.set("sortBy", newSort);
    else newParams.delete("sortBy");
    newParams.set("desc", newDesc === "true" ? "true" : "false");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", newPage.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearGenreFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("genreId");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Browse Games</h1>
          <p className="text-gray-400">Discover your next favorite title.</p>

          {/* Active Genre Badge */}
          {genreId && (
            <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded-full w-fit">
              <span className="text-xs font-medium text-blue-400">
                Filtering by Genre
              </span>
              <button
                onClick={clearGenreFilter}
                className="text-blue-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative grow md:grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={`${sortBy}-${desc}`}
              onChange={handleSortChange}
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

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-60" : "opacity-100"}`}>
        {games.map((game) => (
          <Link to={`/games/${game.id}`} key={game.id} className="block">
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

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                pageNum === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
