import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";

import { authService } from "../api/auth.service";
import { useAuth } from "../context/AuthContext";
import { LoginCredentials } from "../types";

// Zod Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const Login = () => {
  const navigate = useNavigate();
  const { login: setAuthContext } = useAuth();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  // NEW: State to trigger the Activation Pending screen
  const [isPendingActivation, setIsPendingActivation] = useState(false);

  // React Query Mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (userData) => {
      setAuthContext(userData);
      navigate("/");
    },
    onError: (error: any) => {
      const problemDetails = error.response?.data;

      // Intercept the specific backend error for Inactive accounts
      if (
        problemDetails?.title === "Auth.Inactive" ||
        problemDetails?.detail?.includes("pending activation")
      ) {
        setIsPendingActivation(true);
        return;
      }

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

    const validationResult = loginSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        if (key) {
          errors[key] = issue.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    loginMutation.mutate(formData);
  };

  // FULL SCREEN: Login Pending Activation Intercept
  if (isPendingActivation) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Activation Pending
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Your administrator account is currently pending activation by a
            SuperAdmin. You cannot access the system until your account is
            approved.
          </p>
          <button
            onClick={() => {
              setIsPendingActivation(false);
              setFormData({ email: "", password: "" }); // reset form
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg font-medium transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">
            Sign in to access your custom lists and reviews.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-500/50 flex items-start gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-3 bg-gray-950 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  validationErrors.email ? "border-red-500" : "border-gray-800"
                }`}
                placeholder="developer@gamestore.com"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-2 text-sm text-red-400">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full pl-10 pr-12 py-3 bg-gray-950 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  validationErrors.password
                    ? "border-red-500"
                    : "border-gray-800"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none">
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-2 text-sm text-red-400">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
