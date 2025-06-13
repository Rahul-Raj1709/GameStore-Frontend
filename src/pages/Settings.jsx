import { useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { updateUsername } from "../api/users";

const Settings = () => {
  const { user, token, login } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUsername(username, token);
      toast.success("Username updated!");
      login(response.token);
    } catch (error) {
      toast.error("Failed to update username.");
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "/account/update-email",
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Email updated!");
      login(response.data.token);
    } catch (error) {
      toast.error("Failed to update email.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "/account/update-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error("Failed to update password.");
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        Please login to manage your account settings.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🛠️ Account Settings
      </h2>

      {/* User Info */}
      <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded">
        <p>
          <strong>Username:</strong> {user?.username}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </div>

      {/* Username */}
      <form
        onSubmit={handleUpdateUsername}
        className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded"
      >
        <h3 className="font-semibold mb-2">Update Username</h3>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 rounded w-full mb-3"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Update Username
        </button>
      </form>

      {/* Email */}
      <form
        onSubmit={handleUpdateEmail}
        className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded"
      >
        <h3 className="font-semibold mb-2">Update Email</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 rounded w-full mb-3"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Update Email
        </button>
      </form>

      {/* Password */}
      <form
        onSubmit={handleUpdatePassword}
        className="p-4 border border-gray-300 dark:border-gray-600 rounded"
      >
        <h3 className="font-semibold mb-2">Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 rounded w-full mb-3"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 rounded w-full mb-3"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default Settings;
