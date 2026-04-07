import { useQuery } from "@tanstack/react-query";
import { gamesService } from "./games.service";

export const useGameDetails = (id: number) => {
  return useQuery({
    queryKey: ["game", id],
    queryFn: () => gamesService.getGameById(id),
    enabled: !!id, // Only run the query if an ID is provided
  });
};
