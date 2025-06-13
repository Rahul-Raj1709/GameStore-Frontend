import axios from "./axiosInstance";

export const fetchGames = async ({ search, genreId, page, pageSize, sort }) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (genreId) params.append("genreId", genreId);
  if (page) params.append("page", page);
  if (pageSize) params.append("pageSize", pageSize);
  if (sort) params.append("sort", sort);

  const response = await axios.get(`/games?${params.toString()}`);
  return response.data;
};

export const fetchGenres = async () => {
  const response = await axios.get("/genres");
  return response.data;
};

// ✅ Add & Update Game
export const createGame = async (gameData) => {
  const response = await axios.post("/games", gameData);
  return response.data;
};

export const updateGame = async (id, gameData) => {
  const response = await axios.put(`/games/${id}`, gameData);
  return response.data;
};

export const deleteGame = async (id) => {
  const response = await axios.delete(`/games/${id}`);
  return response.data;
};
