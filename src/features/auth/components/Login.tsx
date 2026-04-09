import { useState, useRef } from "react";
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
  Fingerprint,
} from "lucide-react";
import { authService } from "../api/auth.service";
import { useAuth } from "../context/AuthContext";
import { LoginCredentials } from "../types";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const loginSchema = z.object({
  email: z.string().email("Invalid coordinates (email)."),
  password: z.string().min(6, "Passcode too short."),
});

export const Login = () => {
  const navigate = useNavigate();
  const { login: setAuthContext } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPendingActivation, setIsPendingActivation] = useState(false);

  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.2)" },
    );
  }, [isPendingActivation]); // Re-run animation if state swaps

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (userData) => {
      setAuthContext(userData);
      navigate("/");
    },
    onError: (error: any) => {
      const problemDetails = error.response?.data;
      if (
        problemDetails?.title === "Auth.Inactive" ||
        problemDetails?.detail?.includes("pending activation")
      ) {
        setIsPendingActivation(true);
        return;
      }
      setApiError(problemDetails?.detail || "Authentication sequence failed.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError(null);

    const validationResult = loginSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        errors[String(issue.path[0])] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }
    loginMutation.mutate(formData);
  };

  if (isPendingActivation) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div
          ref={cardRef}
          className="w-full max-w-md p-10 rounded-[2.5rem] bg-gray-900/60 backdrop-blur-xl border border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.1)] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none" />
          <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <h2 className="text-3xl font-black text-white mb-4">
            Clearance Pending
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed font-medium">
            Your credentials are valid, but your access tier requires SuperAdmin
            authorization. Please standby.
          </p>
          <button
            onClick={() => {
              setIsPendingActivation(false);
              setFormData({ email: "", password: "" });
            }}
            className="w-full py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-2xl font-bold transition-all tracking-wider text-sm uppercase">
            Acknowledge & Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div
        ref={cardRef}
        className="w-full max-w-md p-10 rounded-[2.5rem] bg-gray-900/60 backdrop-blur-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-500/30">
            <Fingerprint className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            Identify
          </h2>
          <p className="text-gray-400 font-medium">
            Authenticate to access the network.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/30 flex items-start gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              Comms Channel
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 bg-gray-950/50 border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium shadow-inner"
                placeholder="user@gamestore.net"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-2 text-xs text-red-400 font-bold">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              Passcode
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-12 pr-12 py-4 bg-gray-950/50 border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium shadow-inner"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-2 text-xs text-red-400 font-bold">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-2">
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider">
              Bypass Security?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-4 mt-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] uppercase tracking-wider text-sm">
            {loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </span>
            ) : (
              "Initialize Session"
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-gray-800/50">
          <p className="text-sm text-gray-500 font-medium">
            New operator?{" "}
            <Link
              to="/register"
              className="text-white hover:text-blue-400 transition-colors font-bold ml-1">
              Establish Link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
