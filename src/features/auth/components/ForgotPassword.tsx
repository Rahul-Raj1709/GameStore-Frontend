import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Loader2,
  Mail,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { authService } from "../api/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (data) => {
      // For development, the backend returns the token directly
      setResetToken(data.resetToken);
    },
    onError: (error: any) => {
      const problemDetails = error.response?.data;
      setApiError(
        problemDetails?.detail ||
          problemDetails?.title ||
          "Failed to process request.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      setValidationError(validationResult.error.issues[0].message);
      return;
    }

    mutation.mutate({ email });
  };

  if (resetToken) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Email Sent!</h2>
          <p className="text-gray-300 mb-6 text-sm">
            In a real app, you would check your inbox. For development, here is
            your token:
          </p>

          <div className="bg-gray-950 p-3 rounded border border-gray-800 mb-6 overflow-x-auto">
            <code className="text-xs text-green-400 select-all">
              {resetToken}
            </code>
          </div>

          <Link
            to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Continue to Reset Password <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400 text-sm">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-500/50 flex items-start gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-950 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${validationError ? "border-red-500" : "border-gray-800"}`}
                placeholder="developer@gamestore.com"
              />
            </div>
            {validationError && (
              <p className="mt-2 text-sm text-red-400">{validationError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
