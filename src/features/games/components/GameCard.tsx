import { memo, useRef } from "react";
import { GameSummary } from "../types"; //
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Calendar, Tag, ArrowUpRight, Gamepad2 } from "lucide-react";

interface GameCardProps {
  game: GameSummary;
}

export const GameCard = memo(({ game }: GameCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Entrance and Hover Animations
  useGSAP(() => {
    // Entrance animation on mount
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
    );
  }, []);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      y: -8,
      scale: 1.02,
      borderColor: "#3b82f6", // blue-500
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      borderColor: "#1f2937", // gray-800
      duration: 0.3,
      ease: "power2.inOut",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group flex flex-col h-full cursor-pointer transition-shadow hover:shadow-2xl hover:shadow-blue-900/20">
      {/* Decorative Placeholder / Cover Image using Tailwind v4 syntax */}
      <div className="relative aspect-16/10 bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Gamepad2 className="w-16 h-16 text-gray-700 group-hover:text-blue-500/50 transition-colors duration-500" />

        {/* Floating Genre Badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-950/80 backdrop-blur-md border border-gray-700 text-blue-400 text-[10px] uppercase font-bold tracking-wider rounded-lg">
            <Tag size={12} />
            {game.genre}
          </span>
        </div>

        {/* Floating Arrow (Indicates clickability on hover) */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col grow">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
            {game.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
            <Calendar size={14} />
            <span>{new Date(game.releaseDate).getFullYear()}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-800/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
              Price
            </span>
            <span
              className={`text-lg font-black ${game.price === 0 || game.price === null ? "text-green-400" : "text-white"}`}>
              {game.price && game.price > 0
                ? `$${game.price.toFixed(2)}`
                : "FREE"}
            </span>
          </div>
          {/* View Button removed as clicking anywhere on the card navigates to the game */}
        </div>
      </div>
    </div>
  );
});

GameCard.displayName = "GameCard";
