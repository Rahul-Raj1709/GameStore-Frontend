import axios from "./axiosInstance";

export const getAllUsers = async ({
  search = "",
  role = "",
  page = 1,
  pageSize = 10,
}) => {
  const params = {
    search,
    role,
    page,
    pageSize,
  };

  const res = await axios.get("/auth/users", { params });
  return res.data;
};

export const deleteUser = async (id) => {
  return await axios.delete(`/auth/users/${id}`);
};

export const toggleUserRole = async (id) => {
  return await axios.put(`/auth/users/${id}/role`);
};

export const updateEmail = async ({ newEmail }) => {
  return await axios.put("/auth/users/email", { newEmail });
};

export const updatePassword = async ({ currentPassword, newPassword }) => {
  return await axios.put("/auth/users/password", {
    currentPassword,
    newPassword,
  });
};

export const updateUsername = async (username, token) => {
  const response = await axios.put(
    "/auth/users/username",
    { username },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
