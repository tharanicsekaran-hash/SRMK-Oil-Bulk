"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/LanguageProvider";
import { useToast } from "@/store/toast";

type Tab = "login" | "signup" | "forgot";
type ForgotStep = "phone" | "otp" | "password";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { locale } = useI18n();
  const showToast = useToast((s) => s.show);

  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<ForgotStep>("phone");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(3);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        phone: loginPhone,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast(
          locale === "en" ? "Login successful!" : "உள்நுழைவு வெற்றிகரமாக!",
          "success"
        );
        router.push(redirectUrl);
        router.refresh();
      }
    } catch {
      showToast(
        locale === "en" ? "Login failed" : "உள்நுழைவு தோல்வியுற்றது",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          phone: signupPhone,
          password: signupPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error, "error");
        return;
      }

      showToast(
        locale === "en"
          ? "Account created! Please login."
          : "கணக்கு உருவாக்கப்பட்டது! உள்நுழையவும்.",
        "success"
      );

      // Auto-fill login form
      setLoginPhone(signupPhone);
      setLoginPassword(signupPassword);
      setTab("login");
    } catch {
      showToast(
        locale === "en" ? "Signup failed" : "பதிவு தோல்வியுற்றது",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error, "error");
        return;
      }

      showToast(data.message, "success");
      setForgotStep("otp");
    } catch {
      showToast(
        locale === "en" ? "Failed to send OTP" : "OTP அனுப்ப முடியவில்லை",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, otp: forgotOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attemptsLeft !== undefined) {
          setOtpAttemptsLeft(data.attemptsLeft);
        }
        showToast(data.error, "error");
        return;
      }

      setVerificationToken(data.verificationToken);
      showToast(data.message, "success");
      setForgotStep("password");
    } catch {
      showToast(
        locale === "en" ? "Failed to verify OTP" : "OTP சரிபார்க்க முடியவில்லை",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: forgotPhone,
          newPassword: forgotNewPassword,
          verificationToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error, "error");
        return;
      }

      showToast(
        locale === "en"
          ? "Password reset successful! Please login."
          : "கடவுச்சொல் மீட்டமைக்கப்பட்டது! உள்நுழையவும்.",
        "success"
      );

      // Reset forgot password state and switch to login
      setForgotStep("phone");
      setForgotPhone("");
      setForgotOtp("");
      setForgotNewPassword("");
      setVerificationToken("");
      setTab("login");
    } catch {
      showToast(
        locale === "en"
          ? "Failed to reset password"
          : "கடவுச்சொல் மீட்டமைக்க முடியவில்லை",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md border p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center">
            {locale === "en" ? "My Account" : "எனது கணக்கு"}
          </h1>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
                tab === "login"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "en" ? "Login" : "உள்நுழைவு"}
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
                tab === "signup"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "en" ? "Sign Up" : "பதிவு"}
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {locale === "en" ? "Phone Number" : "தொலைபேசி எண்"}
                </label>
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={(e) =>
                    setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10 digits"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {locale === "en" ? "Password" : "கடவுச்சொல்"}
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setTab("forgot")}
                className="text-sm text-orange-600 hover:underline"
              >
                {locale === "en" ? "Forgot Password?" : "கடவுச்சொல் மறந்துவிட்டதா?"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {loading
                  ? locale === "en"
                    ? "Logging in..."
                    : "உள்நுழைகிறது..."
                  : locale === "en"
                  ? "Login"
                  : "உள்நுழைவு"}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {locale === "en" ? "Name (Optional)" : "பெயர் (விருப்பமானது)"}
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder={locale === "en" ? "Your name" : "உங்கள் பெயர்"}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {locale === "en" ? "Phone Number" : "தொலைபேசி எண்"} *
                </label>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) =>
                    setSignupPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10 digits"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {locale === "en" ? "Password" : "கடவுச்சொல்"} *
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {loading
                  ? locale === "en"
                    ? "Creating account..."
                    : "கணக்கை உருவாக்குகிறது..."
                  : locale === "en"
                  ? "Create Account"
                  : "கணக்கை உருவாக்கவும்"}
              </button>
            </form>
          )}

          {/* Forgot Password Flow */}
          {tab === "forgot" && (
            <div className="space-y-4">
              <button
                onClick={() => setTab("login")}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                ← {locale === "en" ? "Back to Login" : "உள்நுழைவுக்குத் திரும்பு"}
              </button>

              {/* Step 1: Enter Phone */}
              {forgotStep === "phone" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {locale === "en" ? "Phone Number" : "தொலைபேசி எண்"}
                    </label>
                    <input
                      type="tel"
                      value={forgotPhone}
                      onChange={(e) =>
                        setForgotPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="10 digits"
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading
                      ? locale === "en"
                        ? "Sending OTP..."
                        : "OTP அனுப்புகிறது..."
                      : locale === "en"
                      ? "Send OTP"
                      : "OTP அனுப்பவும்"}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    {locale === "en"
                      ? "Development Mode: OTP is always 123456"
                      : "மேம்பாட்டு முறை: OTP எப்போதும் 123456"}
                  </p>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {forgotStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {locale === "en" ? "Enter OTP" : "OTP உள்ளிடவும்"}
                    </label>
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) =>
                        setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="123456"
                      className="w-full border rounded px-3 py-2 text-center text-2xl tracking-widest"
                      required
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {locale === "en"
                        ? `Attempts left: ${otpAttemptsLeft}`
                        : `மீதமுள்ள முயற்சிகள்: ${otpAttemptsLeft}`}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading
                      ? locale === "en"
                        ? "Verifying..."
                        : "சரிபார்க்கிறது..."
                      : locale === "en"
                      ? "Verify OTP"
                      : "OTP சரிபார்க்கவும்"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep("phone")}
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    {locale === "en" ? "Resend OTP" : "OTP மீண்டும் அனுப்பவும்"}
                  </button>
                </form>
              )}

              {/* Step 3: Set New Password */}
              {forgotStep === "password" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {locale === "en" ? "New Password" : "புதிய கடவுச்சொல்"}
                    </label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading
                      ? locale === "en"
                        ? "Resetting..."
                        : "மீட்டமைக்கிறது..."
                      : locale === "en"
                      ? "Reset Password"
                      : "கடவுச்சொல்லை மீட்டமைக்கவும்"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}

