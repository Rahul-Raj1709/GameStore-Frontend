import { memo, useRef } from "react";
import { GameSummary } from "../types";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface GameCardProps {
  game: GameSummary;
}

export const GameCard = memo(({ game }: GameCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    );
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors group flex flex-col h-full cursor-pointer">
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
});

// Add display name for React DevTools (since we used memo)
GameCard.displayName = "GameCard";
