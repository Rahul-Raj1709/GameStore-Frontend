import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 dark:bg-gray-800 text-white px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
      <h1 className="text-2xl font-bold">
        <Link to="/" className="hover:text-blue-400 transition">
          GameStore
        </Link>
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {/* 🌗 Toggle Theme */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 border border-gray-500 rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition"
        >
          {dark ? "🌞 Light" : "🌙 Dark"}
        </button>

        {/* Authenticated user info */}
        {user && (
          <span className="hidden sm:inline text-gray-300">
            Welcome, <strong>{user.username}</strong>
          </span>
        )}

        {/* Navigation links */}
        {user ? (
          <>
            <Link to="/games" className="hover:text-blue-400 transition">
              Games
            </Link>
            <Link to="/collection" className="hover:text-blue-400 transition">
              My Collection
            </Link>
            <Link to="/settings" className="hover:text-blue-400 transition">
              Profile
            </Link>
            {user.role === "Admin" && (
              <Link to="/admin" className="hover:text-blue-400 transition">
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-red-400 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:text-blue-400 transition">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
