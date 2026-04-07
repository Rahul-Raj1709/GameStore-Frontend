import { GameSummary } from "../types";

interface GameCardProps {
  game: GameSummary;
}

export const GameCard = ({ game }: GameCardProps) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors group cursor-pointer flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
          {game.name}
        </h3>
        <span className="inline-block mt-2 px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full font-medium">
          {game.genre}
        </span>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-800">
        <span className="text-gray-400 text-sm">
          {new Date(game.releaseDate).getFullYear()}
        </span>
        <span className="text-lg font-bold text-white">
          {game.price !== null ? `$${game.price.toFixed(2)}` : "Free"}
        </span>
      </div>
    </div>
  );
};
