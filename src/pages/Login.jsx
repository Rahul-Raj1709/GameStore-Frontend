import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token } = await loginUser(email, password);
      login(token);
      navigate("/games");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
          Log In
        </h2>

        {error && (
          <p className="text-red-600 dark:text-red-400 mb-4 text-center text-sm">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 dark:border-gray-600 p-2 mb-4 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 dark:border-gray-600 p-2 mb-4 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          required
        />

        <button
          type="submit"
          className={`w-full py-2 rounded transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          New here?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer dark:text-blue-400"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
