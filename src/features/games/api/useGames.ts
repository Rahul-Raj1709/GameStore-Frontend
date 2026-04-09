import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { gamesService } from "./games.service";
import { GetGamesParams } from "../types";

export const useGames = (params: GetGamesParams) => {
  return useQuery({
    queryKey: ["games", params],
    queryFn: () => gamesService.getGames(params),
    placeholderData: keepPreviousData, // Keeps old data visible while new page loads
  });
};
