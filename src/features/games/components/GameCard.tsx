import { memo } from "react";
import { GameSummary } from "../types";
import { Calendar, Tag, ArrowUpRight, Gamepad2 } from "lucide-react";

interface GameCardProps {
  game: GameSummary;
}

export const GameCard = memo(({ game }: GameCardProps) => {
  return (
    <div className="relative bg-gray-950/80 border border-white/5 rounded-3xl overflow-hidden group flex flex-col h-full cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-blue-500/30 backdrop-blur-md">
      <div className="relative aspect-4/3 bg-linear-to-br from-gray-900 to-black flex items-center justify-center overflow-hidden">
        {game.imageUrl ? (
          <img
            src={game.imageUrl}
            alt={game.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Gamepad2 className="w-16 h-16 text-gray-800 group-hover:text-blue-500/30 transition-colors duration-500" />
          </>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-transparent to-transparent" />

        <div className="absolute top-4 left-4">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 text-blue-300 text-[9px] uppercase font-black tracking-widest rounded-xl shadow-lg">
            <Tag size={10} />
            {game.genre}
          </span>
        </div>

        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 ease-out">
          <div className="p-2.5 bg-blue-600/90 backdrop-blur-md rounded-xl text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <ArrowUpRight size={16} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col grow relative z-10 bg-gray-950/90">
        <div className="mb-4">
          <h3 className="text-xl font-black text-white leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-blue-400 group-hover:to-indigo-300 transition-all line-clamp-1">
            {game.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-xs font-bold tracking-wider">
            <Calendar size={12} className="text-gray-600" />
            <span>{new Date(game.releaseDate).getFullYear()}</span>
          </div>
        </div>

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-800/50">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-0.5">
              Exchange Rate
            </span>
            <span
              className={`text-lg font-black tracking-tight ${game.price === 0 || game.price === null ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" : "text-white"}`}>
              {game.price && game.price > 0
                ? `$${game.price.toFixed(2)}`
                : "FREE ACCESS"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

GameCard.displayName = "GameCard";
