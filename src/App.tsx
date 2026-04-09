import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  Link,
  useLocation, // Add this import
} from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import { Login } from "./features/auth/components/Login";
import { ForgotPassword } from "./features/auth/components/ForgotPassword";
import { ResetPassword } from "./features/auth/components/ResetPassword";
import { Register } from "./features/auth/components/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GameDetailsPage } from "./features/games/components/GameDetailsPage";
import { Roles } from "./types";
import { AdminManagement } from "./features/users/components/AdminManagement";
import { AddGamePage } from "./features/games/components/AddGamePage";
import { EditGamePage } from "./features/games/components/EditGamePage";
import { HomePage } from "./pages/HomePage";
import { PageTransition } from "./components/PageTransition";
import { Sidebar } from "./components/Sidebar";

// Import the new List pages
import { MyListsPage } from "./features/users/components/MyListsPage";
import { CustomListDetailsPage } from "./features/users/components/CustomListDetailsPage";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex justify-between items-center sticky top-0 z-50">
      <Link
        to="/"
        className="text-xl font-bold text-white tracking-wide md:hidden">
        GameStore
      </Link>
      <div className="flex gap-4 items-center ml-auto text-sm">
        {isAuthenticated ? (
          <span className="text-gray-400">
            Welcome,{" "}
            <span className="text-white font-medium">{user?.username}</span>
          </span>
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
  const location = useLocation();
  const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-200">
      {/* Sidebar handles its own width transitions */}
      {!isAuthPage && <Sidebar />}

      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
        {!isAuthPage && <Navbar />}

        <main className={`grow ${!isAuthPage ? "p-6" : ""}`}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <ScrollRestoration />
      </div>
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
