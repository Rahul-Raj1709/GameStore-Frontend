import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getAllUsers, deleteUser, toggleUserRole } from "../api/users";
import { useAuth } from "../context/AuthContext";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const loadUsers = async () => {
    try {
      const res = await getAllUsers({ search, role: roleFilter, page });
      setUsers(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Could not load users");
    }
  };

  useEffect(() => {
    if (user?.role === "Admin") loadUsers();
  }, [search, roleFilter, page]);

  const handleDelete = async (id) => {
    if (id === user?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }

    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        toast.success("User deleted");
        loadUsers();
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleToggleRole = async (id) => {
    try {
      await toggleUserRole(id);
      toast.success("User role updated");
      loadUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
        👋 Welcome, Admin! Rule the GameStore Empire
      </h1>

      <div className="flex justify-center mb-6">
        <Link
          to="/admin/dashboard"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Go to Admin Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="border rounded px-4 py-2 w-full sm:w-1/2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value);
          }}
          className="border rounded px-4 py-2 w-full sm:w-1/4 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded shadow border dark:border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left text-gray-700 dark:text-white">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-4 text-gray-500 dark:text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u, index) => (
                <tr
                  key={u.id}
                  className={`border-t dark:border-gray-700 ${
                    u.id === user?.id
                      ? "bg-yellow-50 dark:bg-yellow-800 font-semibold"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2">{index + 1 + (page - 1) * 10}</td>
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleToggleRole(u.id)}
                      disabled={
                        u.id === user?.id ||
                        u.email === "superadmin@example.com"
                      }
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                    >
                      Toggle Role
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={
                        u.id === user?.id ||
                        u.email === "superadmin@example.com"
                      }
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Admin;
