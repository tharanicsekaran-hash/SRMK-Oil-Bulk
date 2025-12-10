"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/store/toast";
import { LogIn, Loader2, Shield } from "lucide-react";

type AuthTab = "login" | "forgot-password";

export default function AdminAuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const showToast = useToast((state) => state.show);

  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Forgot Password state
  const [forgotPhone, setForgotPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // Redirect if already authenticated with admin/delivery role
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      if (role === "ADMIN" || role === "DELIVERY") {
        router.push("/admin/dashboard");
      } else {
        showToast("Access denied. Admin or Delivery role required.", "error");
        router.push("/");
      }
    }
  }, [session, status, router, showToast]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        phone: loginPhone,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        showToast(result.error, "error");
      } else if (result?.ok) {
        // Session will be checked in useEffect and redirected
        showToast("Login successful!", "success");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("An error occurred during login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!forgotPhone || forgotPhone.length !== 10) {
      showToast("Please enter a valid 10-digit phone number", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "OTP sent successfully!", "success");
        setOtpSent(true);
        setOtpTimer(data.expiresIn || 300);
      } else {
        showToast(data.error || "Failed to send OTP", "error");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      showToast("Failed to send OTP", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "OTP verified successfully!", "success");
        setOtpVerified(true);
        setVerificationToken(data.verificationToken);
      } else {
        showToast(data.error || "Invalid OTP", "error");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      showToast("Failed to verify OTP", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: forgotPhone,
          newPassword,
          verificationToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "Password reset successfully!", "success");
        // Reset form and switch to login
        setActiveTab("login");
        setLoginPhone(forgotPhone);
        setForgotPhone("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setOtpSent(false);
        setOtpVerified(false);
        setVerificationToken("");
      } else {
        showToast(data.error || "Failed to reset password", "error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showToast("Failed to reset password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Secure access for authorized personnel only</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("forgot-password")}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "forgot-password"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Forgot Password
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Login
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === "forgot-password" && (
              <div className="space-y-6">
                {!otpVerified ? (
                  <>
                    <div>
                      <label htmlFor="forgot-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="forgot-phone"
                        type="tel"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        placeholder="10-digit phone number"
                        maxLength={10}
                        disabled={otpSent}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                      />
                    </div>

                    {!otpSent ? (
                      <button
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    ) : (
                      <>
                        <div>
                          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                            Enter OTP (Mock: 123456)
                          </label>
                          <input
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit OTP"
                            maxLength={6}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          {otpTimer > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              OTP expires in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handleVerifyOtp}
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                          </button>
                          <button
                            onClick={() => {
                              setOtpSent(false);
                              setOtp("");
                            }}
                            disabled={isLoading}
                            className="px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            Change Number
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        minLength={6}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        minLength={6}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          For customer login, please visit{" "}
          <a href="/auth" className="text-blue-600 hover:underline">
            customer portal
          </a>
        </p>
      </div>
    </div>
  );
}
