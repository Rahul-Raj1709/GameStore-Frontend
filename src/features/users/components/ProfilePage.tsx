import React, { useState, useEffect, useRef } from "react";
import { useUserProfile } from "../api/useUserProfile";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../api/users.service";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Gamepad2,
  MessageSquare,
  Settings,
  LogOut,
  Save,
  Key,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export const ProfilePage: React.FC = () => {
  const { data: profile, isLoading, error } = useUserProfile();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedHeader = useRef(false); // Tracks if the header has already animated

  // View toggles
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Populate name when profile loads
  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: () => {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["userProfile", "me"] });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: () =>
      setMessage({ type: "error", text: "Failed to update profile." }),
  });

  const changePasswordMutation = useMutation({
    mutationFn: usersService.changePassword,
    onSuccess: () => {
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: () =>
      setMessage({
        type: "error",
        text: "Failed to change password. Check your current password.",
      }),
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent API call if empty OR if the name hasn't changed
    if (name.trim() === "" || name === profile?.name) return;

    updateProfileMutation.mutate({ name });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
  };

  // --- GSAP Animations ---

  // 1. Initial Page Load Animation (Header) - Runs ONLY ONCE
  useGSAP(
    () => {
      if (profile && !hasAnimatedHeader.current) {
        gsap.fromTo(
          ".profile-header",
          { opacity: 0, y: 30, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" },
        );
        hasAnimatedHeader.current = true; // Mark as animated so it never runs again
      }
    },
    { dependencies: [profile], scope: containerRef },
  );

  // 2. View Toggle Animations (Stats vs Forms) - Runs when 'isEditing' changes
  useGSAP(
    () => {
      if (!profile) return; // Wait for data to be ready

      if (isEditing) {
        gsap.fromTo(
          ".edit-form",
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" },
        );
      } else {
        gsap.fromTo(
          ".stats-card",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" },
        );
      }
    },
    { dependencies: [isEditing], scope: containerRef },
  );

  // 3. Alert Message Bounce Animation - Runs when 'message' changes
  useGSAP(
    () => {
      if (message) {
        gsap.fromTo(
          ".alert-message",
          { opacity: 0, y: -20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" },
        );
      }
    },
    { dependencies: [message], scope: containerRef },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Profile Unavailable
        </h2>
        <p className="text-gray-400">
          We couldn't load your profile data right now.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-6">
      {/* Alert Messages */}
      {message && (
        <div
          className={`alert-message p-4 rounded-xl flex items-center gap-3 border shadow-lg ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400 shadow-green-500/5"
              : "bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5"
          }`}>
          {message.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="profile-header bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 border border-white/10 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05),0_0_30px_rgba(59,130,246,0.3)]">
              <span className="text-4xl font-black text-white">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <User size={16} /> @{profile.username || "N/A"}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span className="text-blue-400 uppercase tracking-widest text-[10px] font-black bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Shield size={12} /> {profile.role}
                </span>
                <span
                  className={`uppercase tracking-widest text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 border ${
                    profile.isActive
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${profile.isActive ? "bg-green-400" : "bg-red-400"}`}
                  />
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors border border-gray-700">
            <Settings
              size={18}
              className={`transition-transform duration-500 ${isEditing ? "rotate-180" : ""}`}
            />
            {isEditing ? "Cancel Editing" : "Edit Settings"}
          </button>
        </div>
      </div>

      {/* Dynamic Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Stats (Hidden on mobile if editing to save space) */}
        <div
          className={`space-y-6 lg:col-span-1 ${isEditing ? "hidden lg:block opacity-50 grayscale transition-all duration-500" : ""}`}>
          {/* Contact Card */}
          <div className="stats-card bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Contact Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">
                    Email Address
                  </p>
                  <p className="text-sm font-medium truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Member Since
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(profile.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="stats-card bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-950/50 border border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <Gamepad2 size={24} className="text-blue-500 mb-2" />
                <span className="text-2xl font-black text-white">
                  {profile.ownedGamesCount}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Owned
                </span>
              </div>
              <div className="bg-gray-950/50 border border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <MessageSquare size={24} className="text-indigo-500 mb-2" />
                <span className="text-2xl font-black text-white">
                  {profile.reviewsCount}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Reviews
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="stats-card w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl transition-colors border border-red-500/20 shadow-xl">
            <LogOut size={18} />
            Sever Connection
          </button>
        </div>

        {/* Right Column: Forms (Only visible when editing) */}
        {isEditing && (
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Update Form */}
            <form
              onSubmit={handleUpdateProfile}
              className="edit-form bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <User size={20} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Public Profile</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                    placeholder="Enter your display name"
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    // Disable if pending, if empty, OR if the input matches the original name
                    disabled={
                      updateProfileMutation.isPending ||
                      name === profile?.name ||
                      name.trim() === ""
                    }
                    className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600">
                    <Save size={18} />
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>

            {/* Password Update Form */}
            <form
              onSubmit={handleChangePassword}
              className="edit-form bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Key size={20} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Security</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700 disabled:opacity-50">
                    <Shield size={18} />
                    {changePasswordMutation.isPending
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
