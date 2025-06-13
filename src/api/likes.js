import axios from "./axiosInstance";

// ✅ Like a game
export const likeGame = (gameId) => {
  return axios.post(`/games/${gameId}/like`);
};

// ✅ Unlike a game
export const unlikeGame = (gameId) => {
  return axios.delete(`/games/${gameId}/like`);
};

// ✅ Get liked games for logged-in user
export const fetchLikedGames = () => {
  return axios.get("/me/likes").then((res) => res.data);
};
