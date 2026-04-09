import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext"; //
import { Roles } from "../types"; //
import { useQuery } from "@tanstack/react-query";
import { genresService } from "../features/games/api/genres.service"; //
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
  Menu,
} from "lucide-react";

export const Sidebar = () => {
  const { user, isAuthenticated, logout } = useAuth(); //
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: () => genresService.getGenres(), //
  });

  // Navigation items with role-based access
  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: <Home size={22} />,
      roles: [Roles.SuperAdmin, Roles.Admin, Roles.Customer, null],
    },
    {
      label: "Add Game",
      to: "/games/new",
      icon: <PlusSquare size={22} />,
      roles: [Roles.SuperAdmin, Roles.Admin],
    },
    {
      label: "Manage Admins",
      to: "/admin-management",
      icon: <Users size={22} />,
      roles: [Roles.SuperAdmin],
    },
    {
      label: "My Lists",
      to: "/my-lists",
      icon: <List size={22} />,
      roles: [Roles.Customer],
    },
  ];

  const filteredItems = navItems.filter((item) =>
    item.roles.includes((user?.role as Roles) || null),
  );

  const handleGenreClick = (genreId: number) => {
    navigate(`/?genreId=${genreId}`);
  };

  // Logic to determine if Categories should be shown:
  // Show for Guests (user is null) and Customers
  const showCategories = !user || user.role === Roles.Customer;

  return (
    <aside
      className={`bg-gray-900 border-r border-gray-800 flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}>
      <div
        className={`p-4 flex items-center ${isCollapsed ? "flex-col gap-6" : "justify-between"}`}>
        <Link
          to="/"
          className="flex items-center gap-3 text-xl font-bold text-white overflow-hidden shrink-0">
          <Gamepad2 className="text-blue-500 shrink-0" size={28} />
          {!isCollapsed && (
            <span className="transition-opacity duration-300 whitespace-nowrap">
              GameStore
            </span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0">
          <Menu size={24} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              } ${isCollapsed ? "justify-center" : ""}`}>
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* --- Categories Section (Conditional) --- */}
        {showCategories && (
          <div className="pt-4 border-t border-gray-800/50">
            <button
              onClick={() => !isCollapsed && setIsCategoryOpen(!isCategoryOpen)}
              className={`group relative w-full flex items-center py-2 text-gray-500 hover:text-white transition-colors ${
                isCollapsed ? "justify-center px-0" : "justify-between px-3"
              }`}>
              <div className="flex items-center gap-3">
                <LayoutGrid size={22} className="shrink-0" />
                {!isCollapsed && (
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Categories
                  </span>
                )}
              </div>
              {!isCollapsed &&
                (isCategoryOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                ))}

              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700">
                  Categories
                </div>
              )}
            </button>

            {isCategoryOpen && !isCollapsed && (
              <div className="mt-1 space-y-1 ml-4 border-l border-gray-800">
                {genres?.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreClick(genre.id)}
                    className="w-full text-left px-6 py-2 text-sm text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 rounded-r-md transition-all truncate">
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        {isAuthenticated ? (
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="px-2 py-2">
                <p className="text-[10px] text-blue-400 font-bold uppercase">
                  {user?.role}
                </p>
                <p className="text-sm text-gray-300 truncate font-medium">
                  {user?.username}
                </p>
              </div>
            )}
            <button
              onClick={logout}
              className={`group relative w-full flex items-center gap-3 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors ${
                isCollapsed ? "justify-center" : "px-3"
              }`}>
              <LogOut size={22} className="shrink-0" />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/login"
              className={`group relative flex items-center transition-all duration-300 ${
                isCollapsed
                  ? "w-12 h-12 justify-center bg-blue-600 rounded-xl text-white"
                  : "w-full justify-center py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-900/20"
              }`}>
              {isCollapsed ? (
                <LogOut size={22} className="rotate-180" />
              ) : (
                "Log In"
              )}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
