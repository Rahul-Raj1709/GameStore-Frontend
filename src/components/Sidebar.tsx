import { useState, useRef } from "react";
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
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  ChevronLeft,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: () => genresService.getGenres(),
  });

  useGSAP(() => {
    gsap.fromTo(
      ".nav-item",
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" },
    );
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      to: "/",
      icon: <Home size={20} />,
      roles: [Roles.SuperAdmin, Roles.Admin, Roles.Customer, null],
    },
    {
      label: "Deploy Game",
      to: "/games/new",
      icon: <PlusSquare size={20} />,
      roles: [Roles.SuperAdmin, Roles.Admin],
    },
    {
      label: "Security Clearance",
      to: "/admin-management",
      icon: <Users size={20} />,
      roles: [Roles.SuperAdmin],
    },
    {
      label: "My Collections",
      to: "/my-lists",
      icon: <List size={20} />,
      roles: [Roles.Customer],
    },
  ];

  const filteredItems = navItems.filter((item) =>
    item.roles.includes((user?.role as Roles) || null),
  );
  const showCategories = !user || user.role === Roles.Customer;

  return (
    <aside
      className={`bg-gray-950/80 backdrop-blur-3xl border-r border-white/5 flex flex-col h-full transition-all duration-400 ease-in-out z-40 ${isCollapsed ? "w-20" : "w-64"}`}>
      {/* Navigation Links */}
      <nav
        ref={navRef}
        className="flex-1 px-4 pt-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item group relative flex items-center gap-3 px-3 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? "bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "text-gray-400 border border-transparent hover:bg-white/5 hover:text-white hover:border-white/10"} ${isCollapsed ? "justify-center" : ""}`}>
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <span className="font-bold text-sm tracking-wide">
                  {item.label}
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Categories (Customers Only) */}
        {showCategories && (
          <div className="pt-6 mt-4 border-t border-gray-800/50 nav-item">
            <button
              onClick={() => !isCollapsed && setIsCategoryOpen(!isCategoryOpen)}
              className={`group relative w-full flex items-center py-2 text-gray-500 hover:text-white transition-colors ${isCollapsed ? "justify-center px-0" : "justify-between px-3"}`}>
              <div className="flex items-center gap-3">
                <LayoutGrid size={20} className="shrink-0 text-blue-500/70" />
                {!isCollapsed && (
                  <span className="text-[10px] font-black uppercase tracking-widest">
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
            </button>
            {isCategoryOpen && !isCollapsed && (
              <div className="mt-2 space-y-1 ml-4 border-l border-gray-800/50">
                {genres?.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => navigate(`/?genreId=${genre.id}`)}
                    className="w-full text-left px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-r-xl transition-all truncate">
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Sidebar Toggle Control (Moved to Bottom) */}
      <div className="p-4 border-t border-gray-800/50 mt-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center w-full p-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors group ${isCollapsed ? "justify-center" : "justify-start gap-3"}`}>
          {isCollapsed ? (
            <ChevronRight
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
          ) : (
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          )}

          {!isCollapsed && (
            <span className="font-bold text-sm tracking-wide">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
};
