import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
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
import { Navbar } from "./components/Navbar";

// Import the new List pages
import { MyListsPage } from "./features/users/components/MyListsPage";
import { CustomListDetailsPage } from "./features/users/components/CustomListDetailsPage";

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
    // 1. Main wrapper is now a column (flex-col) to stack Navbar over the Content
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden">
      {/* 2. Navbar sits at the very top and spans 100% of the screen width */}
      {!isAuthPage && <Navbar />}

      {/* 3. The lower section holds both the Sidebar and the page content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar stays fixed on the left, taking up 100% of the remaining height */}
        {!isAuthPage && <Sidebar />}

        {/* Main scrollable content area */}
        <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
          <main
            className={`grow overflow-y-auto bg-black ${!isAuthPage ? "p-6" : ""}`}>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
          <ScrollRestoration />
        </div>
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
