import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usersService } from "../api/users.service";
import { UserDto, UserDetailsDto } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  ShieldCheck,
  Loader2,
  Eye,
  Trash2,
  Power,
  UserCheck,
  X,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const AdminManagement = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "active";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  const [users, setUsers] = useState<UserDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailsDto | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data =
        activeTab === "active"
          ? await usersService.getAdmins(page, pageSize)
          : await usersService.getPendingAdmins(page, pageSize);
      setUsers(data.items);
      setTotalPages(Math.ceil(data.totalCount / pageSize));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, page]);

  useGSAP(() => {
    if (!loading && users.length > 0) {
      gsap.fromTo(
        "tr.user-row",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [loading, users]);

  const handleViewClick = async (id: number) => {
    setIsViewModalOpen(true);
    setIsLoadingDetails(true);
    setSelectedUser(null);
    try {
      const details = await usersService.getUserDetails(id);
      setSelectedUser(details);
    } catch (err) {
      alert("Failed to load details.");
      setIsViewModalOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    if (
      !window.confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "approve"} this user?`,
      )
    )
      return;
    await usersService.updateUserStatus(id, !currentStatus);
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone."))
      return;
    await usersService.deleteUser(id);
    fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 relative mt-6">
      <div className="relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-300 tracking-tight">
              Security Clearance
            </h1>
            <p className="text-gray-400 font-medium">
              Manage administrators and system access.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-800">
        <button
          onClick={() => setSearchParams({ tab: "active", page: "1" })}
          className={`pb-3 px-6 font-bold transition-all ${activeTab === "active" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-500 hover:text-gray-300"}`}>
          Active Personnel
        </button>
        <button
          onClick={() => setSearchParams({ tab: "pending", page: "1" })}
          className={`pb-3 px-6 font-bold transition-all ${activeTab === "pending" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500 hover:text-gray-300"}`}>
          Pending Clearance
        </button>
      </div>

      <div className="bg-gray-900/40 rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-20 text-center text-gray-500 font-medium text-lg">
            No personnel found in this sector.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-xs font-black tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-5">Identity</th>
                <th className="p-5">Comms (Email)</th>
                <th className="p-5">Clearance Status</th>
                <th className="p-5 text-right">Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="user-row hover:bg-white/2 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-white text-base">
                      {u.name}
                    </div>
                    <div className="text-gray-500 text-xs">@{u.username}</div>
                  </td>
                  <td className="p-5 text-gray-300">{u.email}</td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider border ${u.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                      {u.isActive ? "ACTIVE" : "PENDING"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewClick(u.id)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <>
                          <button
                            onClick={() => toggleStatus(u.id, u.isActive)}
                            className={`p-2 rounded-lg transition-colors border ${u.isActive ? "bg-yellow-900/30 hover:bg-yellow-600/30 text-yellow-400 border-yellow-500/20" : "bg-green-900/30 hover:bg-green-600/30 text-green-400 border-green-500/20"}`}>
                            {u.isActive ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-2 bg-red-900/30 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-500/20">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-14 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() =>
                setSearchParams({ tab: activeTab, page: (i + 1).toString() })
              }
              className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${i + 1 === page ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-110" : "bg-gray-900/50 border border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-white"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Fully Restored & Re-Styled View Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-gray-900/90 border border-purple-500/30 rounded-3xl max-w-md w-full p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">
                Dossier Details
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-white bg-gray-800/50 hover:bg-gray-700 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : selectedUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      Designation
                    </span>
                    <span className="text-white font-medium">
                      {selectedUser.name}
                    </span>
                  </div>
                  <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      Alias
                    </span>
                    <span className="text-white font-medium">
                      @{selectedUser.username}
                    </span>
                  </div>
                  <div className="col-span-2 bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      Comms
                    </span>
                    <span className="text-white font-medium">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      Tier
                    </span>
                    <span className="text-purple-400 font-bold">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      Status
                    </span>
                    <span
                      className={
                        selectedUser.isActive
                          ? "text-green-400 font-bold"
                          : "text-yellow-400 font-bold"
                      }>
                      {selectedUser.isActive ? "ACTIVE" : "PENDING"}
                    </span>
                  </div>
                  <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      Simulations Owned
                    </span>
                    <span className="text-white font-black">
                      {selectedUser.ownedGamesCount}
                    </span>
                  </div>
                  <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      Data Logs
                    </span>
                    <span className="text-white font-black">
                      {selectedUser.reviewsCount}
                    </span>
                  </div>
                  <div className="col-span-2 bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                      Last Secure Login
                    </span>
                    <span className="text-gray-300 font-medium">
                      {selectedUser.lastLogin
                        ? new Date(selectedUser.lastLogin).toLocaleString()
                        : "Never authenticated"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-400 py-4 font-bold text-center">
                Failed to decrypt dossier data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
