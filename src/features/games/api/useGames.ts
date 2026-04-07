import { useInfiniteQuery } from "@tanstack/react-query";
import { gamesService } from "./games.service";
import { GetGamesParams } from "../types";

export const useGames = (params: Omit<GetGamesParams, "page"> = {}) => {
  return useInfiniteQuery({
    queryKey: ["games", params],
    // Default to page 1 for the initial fetch
    queryFn: ({ pageParam = 1 }) =>
      gamesService.getGames({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Use the boolean flag and current page from your backend
      if (lastPage.hasNextPage) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
};
