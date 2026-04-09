import { useState, useRef } from "react";
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
  UserPlus,
} from "lucide-react";
import { authService } from "../api/auth.service";
import { useAuth } from "../context/AuthContext";
import { RegisterCredentials } from "../types";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Designation must be at least 2 characters."),
    username: z.string().min(3, "Alias must be at least 3 characters."),
    email: z.string().email("Invalid comms channel (email)."),
    password: z.string().min(6, "Passcode too short."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passcodes do not match",
    path: ["confirmPassword"],
  });

export const Register = () => {
  const navigate = useNavigate();
  const { login: setAuthContext } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [requestAdmin, setRequestAdmin] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [pendingApprovalMessage, setPendingApprovalMessage] = useState<
    string | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.2)" },
    );
  }, [pendingApprovalMessage]);

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (userData) => {
      if (userData.token === "PENDING_ACTIVATION") {
        setPendingApprovalMessage(
          "Your administrator profile has been created, but requires SuperAdmin authorization before network access is granted.",
        );
      } else {
        setAuthContext(userData);
        navigate("/");
      }
    },
    onError: (error: any) => {
      const problemDetails = error.response?.data;
      setApiError(
        problemDetails?.detail ||
          problemDetails?.title ||
          "Initialization sequence failed.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError(null);

    const validationResult = registerSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        errors[String(issue.path[0])] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    registerMutation.mutate({
      ...formData,
      role: requestAdmin ? "Admin" : "Customer",
    });
  };

  if (pendingApprovalMessage) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div
          ref={cardRef}
          className="w-full max-w-md p-10 rounded-[2.5rem] bg-gray-900/60 backdrop-blur-xl border border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.1)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none" />
          <CheckCircle2 className="w-20 h-20 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <h2 className="text-3xl font-black text-white mb-4">
            Clearance Pending
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed font-medium">
            {pendingApprovalMessage}
          </p>
          <Link
            to="/login"
            className="w-full inline-block py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-2xl font-bold transition-all tracking-wider text-sm uppercase">
            Acknowledge & Return
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div
        ref={cardRef}
        className="w-full max-w-md p-10 rounded-[2.5rem] bg-gray-900/60 backdrop-blur-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/30">
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            Establish Link
          </h2>
          <p className="text-gray-400 font-medium">
            Create a new operator profile.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/30 flex items-start gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Designation
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-11 pr-3 py-3 bg-gray-950/50 border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                  placeholder="John Doe"
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-[10px] text-red-400 font-bold">
                  {validationErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Alias
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-11 pr-3 py-3 bg-gray-950/50 border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                  placeholder="johndoe99"
                />
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-[10px] text-red-400 font-bold">
                  {validationErrors.username}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Comms Channel
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-11 pr-3 py-3 bg-gray-950/50 border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                placeholder="user@gamestore.net"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-[10px] text-red-400 font-bold">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-11 pr-10 py-3 bg-gray-950/50 border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-[10px] text-red-400 font-bold">
                  {validationErrors.password}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Confirm
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-10 py-3 bg-gray-950/50 border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                  placeholder="••••••••"
                />
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-[10px] text-red-400 font-bold">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/50 mt-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-gray-800/30 border border-transparent hover:border-gray-700 transition-all">
              <input
                type="checkbox"
                checked={requestAdmin}
                onChange={(e) => {
                  setRequestAdmin(e.target.checked);
                  setValidationErrors({});
                }}
                className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900 accent-indigo-500"
              />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Request Admin Clearance
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-4 mt-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] uppercase tracking-wider text-sm">
            {registerMutation.isPending ? (
              <span className="flex justify-center items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              "Initialize"
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-800/50">
          <p className="text-sm text-gray-500 font-medium">
            Existing operator?{" "}
            <Link
              to="/login"
              className="text-white hover:text-indigo-400 transition-colors font-bold ml-1">
              Identify
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
