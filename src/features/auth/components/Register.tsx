import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Loader2,
  Mail,
  Lock,
  User,
  AtSign,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

import { authService } from "../api/auth.service";
import { useAuth } from "../context/AuthContext";
import { RegisterCredentials } from "../types";

// Zod Validation Schema
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    username: z.string().min(3, "Username must be at least 3 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const Register = () => {
  const navigate = useNavigate();
  const { login: setAuthContext } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Admin-specific state (Code logic removed)
  const [requestAdmin, setRequestAdmin] = useState(false);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [pendingApprovalMessage, setPendingApprovalMessage] = useState<
    string | null
  >(null);

  // Toggle states for passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Query Mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (userData) => {
      // Backend returns PENDING_ACTIVATION for Admins
      if (userData.token === "PENDING_ACTIVATION") {
        setPendingApprovalMessage(
          "Your administrator account has been created successfully, but it requires approval from a SuperAdmin before you can log in.",
        );
      } else {
        // Direct login for regular customers
        setAuthContext(userData);
        navigate("/");
      }
    },
    onError: (error: any) => {
      const problemDetails = error.response?.data;
      if (problemDetails?.detail) {
        setApiError(problemDetails.detail);
      } else if (problemDetails?.title) {
        setApiError(problemDetails.title);
      } else {
        setApiError("An unexpected network error occurred. Please try again.");
      }
    },
  });

  // Form Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError(null);

    // Validate base form
    const validationResult = registerSchema.safeParse(formData);
    const errors: Record<string, string> = {};

    if (!validationResult.success) {
      validationResult.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        if (key) errors[key] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    // Map to API DTO
    const payload: RegisterCredentials = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: requestAdmin ? "Admin" : "Customer",
    };

    registerMutation.mutate(payload);
  };

  // FULL SCREEN: Registration Pending Activation
  if (pendingApprovalMessage) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Activation Pending
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            {pendingApprovalMessage}
          </p>
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg font-medium transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">Join the store and manage your games.</p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-500/50 flex items-start gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Username Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full pl-9 pr-3 py-2 bg-gray-950 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name ? "border-red-500" : "border-gray-800"}`}
                  placeholder="John Doe"
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={`w-full pl-9 pr-3 py-2 bg-gray-950 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.username ? "border-red-500" : "border-gray-800"}`}
                  placeholder="johndoe99"
                />
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.username}
                </p>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full pl-9 pr-3 py-2 bg-gray-950 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.email ? "border-red-500" : "border-gray-800"}`}
                placeholder="developer@gamestore.com"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-400">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Passwords Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full pl-9 pr-10 py-2 bg-gray-950 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.password ? "border-red-500" : "border-gray-800"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none">
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`w-full pl-9 pr-10 py-2 bg-gray-950 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.confirmPassword ? "border-red-500" : "border-gray-800"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none">
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Admin Registration Toggle */}
          <div className="pt-2 border-t border-gray-800 mt-4">
            <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
              <input
                type="checkbox"
                checked={requestAdmin}
                onChange={(e) => {
                  setRequestAdmin(e.target.checked);
                  setValidationErrors({});
                }}
                className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
              />
              <span className="text-sm font-medium text-gray-300">
                Register as a Store Administrator
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mt-4">
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
