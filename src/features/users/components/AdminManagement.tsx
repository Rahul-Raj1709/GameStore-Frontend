import { useEffect, useState } from "react";
import { usersService } from "../api/users.service";
import { UserDto, UserDetailsDto } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";

export const AdminManagement = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailsDto | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    actionType: "delete" | "toggleStatus" | null;
    userId: number | null;
    currentStatus?: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, actionType: null, userId: null, title: "", message: "" });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        activeTab === "active"
          ? await usersService.getAdmins()
          : await usersService.getPendingAdmins();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  // --- Handlers ---
  const handleViewClick = async (id: number) => {
    setIsViewModalOpen(true);
    setIsLoadingDetails(true);
    setSelectedUser(null);
    try {
      const details = await usersService.getUserDetails(id);
      setSelectedUser(details);
    } catch (err) {
      alert("Failed to load user details.");
      setIsViewModalOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const executeConfirmAction = async () => {
    const { actionType, userId, currentStatus } = confirmConfig;
    if (!userId) return;

    try {
      if (actionType === "delete") {
        await usersService.deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
      } else if (actionType === "toggleStatus") {
        await usersService.updateUserStatus(userId, !currentStatus);
        fetchUsers();
      }
    } catch (err) {
      alert("Action failed. Please try again.");
    } finally {
      setConfirmConfig({ ...confirmConfig, isOpen: false });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Management</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "active"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}>
          Active Admins
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "pending"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-400 hover:text-gray-200"
          }`}>
          Pending Approvals
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-900/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No users found in this category.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-medium text-white">{u.name}</td>
                  <td className="p-4">@{u.username}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.isActive
                          ? "bg-green-900/50 text-green-400"
                          : "bg-yellow-900/50 text-yellow-400"
                      }`}>
                      {u.isActive ? "Active" : "Pending/Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <div className="flex justify-end items-center gap-3">
                      {/* View Button */}
                      <button
                        onClick={() => handleViewClick(u.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="View Details">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>

                      {/* Prevent superadmin from deactivating/deleting themselves */}
                      {u.id !== currentUser?.id && (
                        <>
                          {/* Toggle Status Button (ICONS) */}
                          <button
                            onClick={() =>
                              setConfirmConfig({
                                isOpen: true,
                                actionType: "toggleStatus",
                                userId: u.id,
                                currentStatus: u.isActive,
                                title: u.isActive
                                  ? "Deactivate User"
                                  : "Approve User",
                                message: u.isActive
                                  ? `Are you sure you want to deactivate ${u.name}? They will lose access.`
                                  : `Are you sure you want to approve ${u.name} as an active Admin?`,
                              })
                            }
                            className={`transition-colors ${
                              u.isActive
                                ? "text-yellow-400 hover:text-yellow-300"
                                : "text-green-400 hover:text-green-300"
                            }`}
                            title={
                              u.isActive ? "Deactivate User" : "Approve User"
                            }>
                            {u.isActive ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m4.9 4.9 14.2 14.2" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() =>
                              setConfirmConfig({
                                isOpen: true,
                                actionType: "delete",
                                userId: u.id,
                                title: "Delete User",
                                message: `Are you sure you want to permanently delete ${u.name}? This cannot be undone.`,
                              })
                            }
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Admin">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" x2="10" y1="11" y2="17" />
                              <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                          </button>
                        </>
                      )}

                      {u.id === currentUser?.id && (
                        <span className="text-gray-500 italic text-xs ml-2">
                          Current User
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- View Modal --- */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Admin Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="py-8 text-center text-gray-400">
                Loading details...
              </div>
            ) : selectedUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-400">Name</span>
                    <span className="text-white font-medium">
                      {selectedUser.name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">
                      Username
                    </span>
                    <span className="text-white font-medium">
                      @{selectedUser.username}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-gray-400">Email</span>
                    <span className="text-white font-medium">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Role</span>
                    <span className="text-purple-400 font-medium">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Status</span>
                    <span
                      className={
                        selectedUser.isActive
                          ? "text-green-400 font-medium"
                          : "text-yellow-400 font-medium"
                      }>
                      {selectedUser.isActive ? "Active" : "Pending"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">
                      Games Owned
                    </span>
                    <span className="text-white font-medium">
                      {selectedUser.ownedGamesCount}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">
                      Reviews Written
                    </span>
                    <span className="text-white font-medium">
                      {selectedUser.reviewsCount}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-gray-400">Joined</span>
                    <span className="text-white font-medium">
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-gray-400">
                      Last Login
                    </span>
                    <span className="text-white font-medium">
                      {selectedUser.lastLogin
                        ? new Date(selectedUser.lastLogin).toLocaleString()
                        : "Never logged in"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-400 py-4">Failed to load data.</div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Confirmation Modal --- */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">
              {confirmConfig.title}
            </h2>
            <p className="text-gray-300 mb-6">{confirmConfig.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setConfirmConfig({ ...confirmConfig, isOpen: false })
                }
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={executeConfirmAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                  confirmConfig.actionType === "delete" ||
                  confirmConfig.title.includes("Deactivate")
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
