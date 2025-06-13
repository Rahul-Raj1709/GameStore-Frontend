import { Link } from "react-router-dom";
import React from "react";

function Home() {
  return (
    <div className="text-center py-20 px-4 text-gray-900 dark:text-white bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Welcome to GameStore 🎮</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-300">
        Find your next favorite game!
      </p>
      <Link
        to="/games"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded transition"
      >
        Get Started
      </Link>
    </div>
  );
}

export default Home;
