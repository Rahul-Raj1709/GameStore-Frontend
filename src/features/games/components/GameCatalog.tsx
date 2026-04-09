import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGames } from "../api/useGames";
import { GameCard } from "./GameCard";
import {
  Loader2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const GameCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const desc = searchParams.get("desc") === "true";
  const urlSearch = searchParams.get("search") || "";
  const genreId = searchParams.get("genreId")
    ? parseInt(searchParams.get("genreId")!, 10)
    : undefined;

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 500);
  const pageSize = 12;

  const { data, isLoading, isError, isFetching } = useGames({
    page,
    pageSize,
    search: urlSearch || undefined,
    sortBy: sortBy || undefined,
    desc,
    genreId,
  });
  const games = data?.items || [];
  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearch) newParams.set("search", debouncedSearch);
      else newParams.delete("search");
      newParams.set("page", "1");
      setSearchParams(newParams);
    }
  }, [debouncedSearch, urlSearch, searchParams, setSearchParams]);

  useGSAP(() => {
    if (!isFetching && games.length > 0) {
      gsap.fromTo(
        ".game-card-wrapper",
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.05,
          duration: 0.5,
          ease: "back.out(1.5)",
        },
      );
    }
  }, [isFetching, games]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newDesc] = e.target.value.split("-");
    const newParams = new URLSearchParams(searchParams);
    if (newSort) newParams.set("sortBy", newSort);
    else newParams.delete("sortBy");
    newParams.set("desc", newDesc === "true" ? "true" : "false");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  // Restored: Missing handlePageChange function
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", newPage.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-4">
      <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gray-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <LayoutGrid className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              System Catalog
            </h1>
          </div>
          <p className="text-gray-400 font-medium">
            Browse and acquire available simulations.
          </p>

          {genreId && (
            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-blue-900/30 border border-blue-500/30 rounded-xl w-fit shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Filtered by Category
              </span>
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.delete("genreId");
                  p.set("page", "1");
                  setSearchParams(p);
                }}
                className="text-blue-400 hover:text-white bg-blue-900/50 p-1 rounded-md transition-colors">
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto relative z-10">
          <div className="relative grow sm:grow-0 sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input
              type="text"
              placeholder="Search parameters..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-11 pr-4 py-3 w-full bg-gray-950/50 border border-gray-800 rounded-2xl text-sm font-medium text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3 bg-gray-950/50 border border-gray-800 rounded-2xl px-4 py-3 min-w-50">
            <SlidersHorizontal className="w-4 h-4 text-blue-500 shrink-0" />
            <select
              value={`${sortBy}-${desc}`}
              onChange={handleSortChange}
              className="bg-transparent text-sm font-bold text-gray-300 focus:outline-none cursor-pointer w-full appearance-none">
              <option value="-false">Sort Hierarchy...</option>
              <option value="price-false">Value: Ascending</option>
              <option value="price-true">Value: Descending</option>
              <option value="name-false">Designation: A-Z</option>
              <option value="releaseDate-true">Chronological: Newest</option>
            </select>
          </div>
        </div>
      </div>

      {isError && (
        <div className="p-4 mb-8 rounded-2xl bg-red-900/30 border border-red-500/30 text-red-300 flex items-center gap-3 font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>Database connection lost. Cannot retrieve catalog.</p>
        </div>
      )}

      <div
        ref={gridRef}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${isFetching && !isLoading ? "opacity-50" : "opacity-100"}`}>
        {games.map((game) => (
          <Link
            to={`/games/${game.id}`}
            state={{ from: "Catalog" }}
            key={game.id}
            className="game-card-wrapper block outline-none">
            <GameCard game={game} />
          </Link>
        ))}
      </div>

      {isLoading && games.length === 0 && (
        <div className="flex flex-col justify-center items-center py-32 gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Accessing Database...
          </p>
        </div>
      )}

      {!isLoading && games.length === 0 && (
        <div className="text-center py-32 bg-gray-900/20 rounded-3xl border border-gray-800 border-dashed">
          <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-500">
            No simulations match current parameters.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-14 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${i + 1 === page ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110" : "bg-gray-900/50 border border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-white"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
