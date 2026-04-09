import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Gamepad2, User, LogOut, ChevronDown, ShieldAlert } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useGSAP(() => {
    if (isDropdownOpen && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(2)" },
      );
    }
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="h-20 bg-gray-950/80 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50 px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Left Side: Branding */}
      <Link
        to="/"
        className="flex items-center gap-3 text-xl font-black text-white group">
        <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600/40 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Gamepad2 className="text-blue-400 shrink-0" size={24} />
        </div>
        <span className="tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
          NEXUS
        </span>
      </Link>

      {/* Right Side: User Profile Dropdown */}
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-gray-900/50 border border-gray-800 hover:bg-gray-800 transition-colors group">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
                <User size={16} className="text-white" />
              </div>
              <div className="flex flex-col items-start sm:flex">
                <span className="text-sm font-bold text-white leading-none">
                  {user.username}
                </span>
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1 leading-none">
                  {user.role}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-3 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden py-2">
                <div className="px-4 py-3 border-b border-gray-800/50 mb-2 sm:hidden">
                  <span className="block text-sm font-bold text-white">
                    {user.username}
                  </span>
                  <span className="block text-xs text-blue-400 font-black uppercase mt-1">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  <ShieldAlert size={16} className="text-gray-500" />
                  View Dossier (Profile)
                </button>

                <div className="h-px bg-gray-800/50 my-2 mx-4" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                  <LogOut size={16} />
                  Sever Connection
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] uppercase tracking-wider">
            Identify
          </Link>
        )}
      </div>
    </header>
  );
};
