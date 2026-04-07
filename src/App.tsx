import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import { Login } from "./features/auth/components/Login";
import { GameCatalog } from "./features/games/components/GameCatalog";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GameDetailsPage } from "./features/games/components/GameDetailsPage";
import { RoleGuard } from "./components/RoleGuard";
import { Roles } from "./types";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-white tracking-wide">
        GameStore
      </Link>
      <div className="flex gap-4 items-center text-sm">
        {isAuthenticated ? (
          <>
            <span className="text-gray-400">Welcome, {user?.username}</span>

            {/* SuperAdmin & Admin Links */}
            <RoleGuard allowedRoles={[Roles.SuperAdmin, Roles.Admin]}>
              <Link
                to="/games/new"
                className="text-green-400 hover:text-green-300 font-medium transition-colors">
                + Add Game
              </Link>
            </RoleGuard>

            {/* SuperAdmin Only Links */}
            <RoleGuard allowedRoles={[Roles.SuperAdmin]}>
              <Link
                to="/admin-management"
                className="text-purple-400 hover:text-purple-300 transition-colors">
                Manage Admins
              </Link>
            </RoleGuard>

            {/* Customer Links */}
            <RoleGuard allowedRoles={[Roles.Customer]}>
              <Link
                to="/my-lists"
                className="text-gray-300 hover:text-white transition-colors">
                My Lists
              </Link>
            </RoleGuard>

            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300 transition-colors ml-4">
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-200">
      <Navbar />
      <main className="grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<GameCatalog />} />
          <Route path="/games/:id" element={<GameDetailsPage />} />

          {/* Guest Only */}
          <Route
            element={<ProtectedRoute requireAuth={false} redirectTo="/" />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* ---------------- PROTECTED ROUTES ---------------- */}

          {/* SuperAdmin & Admin Only Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={[Roles.SuperAdmin, Roles.Admin]} />
            }>
            {/* We will build the Add/Edit form next */}
            <Route
              path="/games/new"
              element={
                <div className="p-8 text-center text-gray-400">
                  Add Game Form coming soon...
                </div>
              }
            />
            <Route
              path="/games/:id/edit"
              element={
                <div className="p-8 text-center text-gray-400">
                  Edit Game Form coming soon...
                </div>
              }
            />
          </Route>

          {/* SuperAdmin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={[Roles.SuperAdmin]} />}>
            <Route
              path="/admin-management"
              element={
                <div className="p-8 text-center text-gray-400">
                  Admin Management coming soon...
                </div>
              }
            />
          </Route>

          {/* Customer Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={[Roles.Customer]} />}>
            <Route
              path="/my-lists"
              element={
                <div className="p-8 text-center text-gray-400">
                  Custom Lists coming soon...
                </div>
              }
            />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
