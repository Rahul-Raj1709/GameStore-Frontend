import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { Roles } from "../types";
import { useQuery } from "@tanstack/react-query";
import { genresService } from "../features/games/api/genres.service";
import {
  Home,
  PlusSquare,
  Users,
  List,
  LogOut,
  Gamepad2,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";

export const Sidebar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  // Fetch Genres for the Categories dropdown
  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: () => genresService.getGenres(),
  });

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: <Home size={20} />,
      roles: [Roles.SuperAdmin, Roles.Admin, Roles.Customer, null], // null allows Guest access
    },
    {
      label: "Add Game",
      to: "/games/new",
      icon: <PlusSquare size={20} />,
      roles: [Roles.SuperAdmin, Roles.Admin],
    },
    {
      label: "Manage Admins",
      to: "/admin-management",
      icon: <Users size={20} />,
      roles: [Roles.SuperAdmin],
    },
    {
      label: "My Lists",
      to: "/my-lists",
      icon: <List size={20} />,
      roles: [Roles.Customer],
    },
  ];

  // Filter based on role or treat as null for Guest
  const filteredItems = navItems.filter((item) =>
    item.roles.includes((user?.role as Roles) || null),
  );

  const handleGenreClick = (genreId: number) => {
    // Navigates to home with genre filter
    navigate(`/?genreId=${genreId}`);
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col sticky top-0 h-screen">
      <div className="p-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-white">
          <Gamepad2 className="text-blue-500" />
          <span>GameStore</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {/* Core Navigation */}
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Categories Dropdown Section */}
        <div className="pt-4 border-t border-gray-800/50">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-gray-500 hover:text-white transition-colors uppercase text-xs font-bold tracking-wider">
            <div className="flex items-center gap-3">
              <LayoutGrid size={18} />
              <span>Categories</span>
            </div>
            {isCategoryOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {isCategoryOpen && (
            <div className="mt-1 space-y-1 ml-4 border-l border-gray-800">
              {genres?.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre.id)}
                  className="w-full text-left px-6 py-2 text-sm text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 rounded-r-md transition-all">
                  {genre.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer / Auth Status */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        {isAuthenticated ? (
          <>
            <div className="px-4 py-3 mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Session
              </p>
              <p className="text-sm text-gray-300 truncate">{user?.username}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase">
                {user?.role}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </>
        ) : (
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <p className="text-xs text-gray-500 mb-3 text-center italic">
              Browsing as Guest
            </p>
            <Link
              to="/login"
              className="block w-full text-center py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
              Log In
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
