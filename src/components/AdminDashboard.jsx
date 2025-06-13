import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Could not load dashboard data.");
      }
    };

    fetchStats();
  }, []);

  if (!user || user.role !== "Admin") return <Navigate to="/" />;
  if (error)
    return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  if (!stats)
    return (
      <div className="p-4 text-gray-800 dark:text-gray-100">
        Loading dashboard...
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Games" value={stats.totalGames ?? 0} />
        <StatCard
          title="Avg. Price ($)"
          value={stats.avgPrice?.toFixed(2) ?? "0.00"}
        />
        <StatCard title="Top Game" value={stats.mostExpensiveGame || "N/A"} />
        <StatCard title="Newest Game" value={stats.newestGame || "N/A"} />
      </div>

      <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
        Games by Genre
      </h2>
      <ul className="bg-white dark:bg-gray-800 shadow p-4 rounded space-y-2">
        {stats.genreStats?.length ? (
          stats.genreStats.map((g) => (
            <li
              key={g.genre}
              className="flex justify-between border-b pb-1 last:border-b-0 text-gray-700 dark:text-gray-100 border-gray-200 dark:border-gray-600"
            >
              <span>{g.genre}</span>
              <span className="font-semibold">{g.count}</span>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500 dark:text-gray-400">
            No genre stats available.
          </li>
        )}
      </ul>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
    <h3 className="text-sm text-gray-500 dark:text-gray-300">{title}</h3>
    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
      {value}
    </p>
  </div>
);

export default AdminDashboard;
