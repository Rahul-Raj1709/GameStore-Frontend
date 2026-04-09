import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import { Login } from "./features/auth/components/Login";
import { ForgotPassword } from "./features/auth/components/ForgotPassword";
import { ResetPassword } from "./features/auth/components/ResetPassword";
import { Register } from "./features/auth/components/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GameDetailsPage } from "./features/games/components/GameDetailsPage";
import { RoleGuard } from "./components/RoleGuard";
import { Roles } from "./types";
import { AdminManagement } from "./features/users/components/AdminManagement";
import { AddGamePage } from "./features/games/components/AddGamePage";
import { EditGamePage } from "./features/games/components/EditGamePage";
import { HomePage } from "./pages/HomePage";
import { PageTransition } from "./components/PageTransition";

// Import the new List pages
import { MyListsPage } from "./features/users/components/MyListsPage";
import { CustomListDetailsPage } from "./features/users/components/CustomListDetailsPage";

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

            <RoleGuard allowedRoles={[Roles.SuperAdmin, Roles.Admin]}>
              <Link
                to="/games/new"
                className="text-green-400 hover:text-green-300 font-medium transition-colors">
                + Add Game
              </Link>
            </RoleGuard>

            <RoleGuard allowedRoles={[Roles.SuperAdmin]}>
              <Link
                to="/admin-management"
                className="text-purple-400 hover:text-purple-300 transition-colors">
                Manage Admins
              </Link>
            </RoleGuard>

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
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// Root Layout wraps the UI, Pages, and Scroll logic
const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-200">
      <Navbar />
      <main className="grow">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      {/* Restores scroll position perfectly when navigating back */}
      <ScrollRestoration />
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    ),
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/games/:id", element: <GameDetailsPage /> },
      {
        element: <ProtectedRoute requireAuth={false} redirectTo="/" />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
          { path: "/forgot-password", element: <ForgotPassword /> },
          { path: "/reset-password", element: <ResetPassword /> },
        ],
      },
      {
        element: (
          <ProtectedRoute allowedRoles={[Roles.SuperAdmin, Roles.Admin]} />
        ),
        children: [
          { path: "/games/new", element: <AddGamePage /> },
          { path: "/games/:id/edit", element: <EditGamePage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[Roles.SuperAdmin]} />,
        children: [{ path: "/admin-management", element: <AdminManagement /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={[Roles.Customer]} />,
        children: [
          // Updated Routes for Lists
          { path: "/my-lists", element: <MyListsPage /> },
          { path: "/my-lists/:listId", element: <CustomListDetailsPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
