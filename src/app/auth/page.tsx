"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/LanguageProvider";
import { useToast } from "@/store/toast";

type Tab = "login" | "signup";
type AuthStep = "phone" | "otp";

function AuthContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { locale } = useI18n();
  const showToast = useToast((s) => s.show);

  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginStep, setLoginStep] = useState<AuthStep>("phone");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpExpiry, setLoginOtpExpiry] = useState<number>(0);
  const [loginAttemptsLeft, setLoginAttemptsLeft] = useState(3);

  // Signup state
  const [signupStep, setSignupStep] = useState<AuthStep>("phone");
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupOtp, setSignupOtp] = useState("");
  const [signupOtpExpiry, setSignupOtpExpiry] = useState<number>(0);
  const [signupAttemptsLeft, setSignupAttemptsLeft] = useState(3);

  // Timer for OTP expiry display
  const [remainingTime, setRemainingTime] = useState(0);

  // Handle Send OTP for Login
  const handleLoginSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: loginPhone,
          action: 'login'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error, "error");
        return;
      }

      showToast(
        locale === "en" 
          ? `OTP sent to ${loginPhone}` 
          : `${loginPhone} க்கு OTP அனுப்பப்பட்டது`,
        "success"
      );
      
      // Show dev OTP in development mode
      if (data.devOtp && process.env.NODE_ENV === 'development') {
        console.log("🔐 DEV OTP:", data.devOtp);
        showToast(`DEV MODE - OTP: ${data.devOtp}`, "info");
      }

      setLoginOtpExpiry(data.expiresIn || 300);
      setRemainingTime(data.expiresIn || 300);
      setLoginStep("otp");

      // Start countdown timer
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      showToast(
        locale === "en" ? "Failed to send OTP" : "OTP அனுப்ப முடியவில்லை",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP and Login
  const handleLoginVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in with NextAuth using OTP provider
      const result = await signIn("otp", {
        phone: loginPhone,
        otp: loginOtp,
        redirect: false,
      });

      if (result?.error) {
        showToast(result.error, "error");
        setLoginAttemptsLeft(prev => prev - 1);
      } else if (result?.ok) {
        showToast(
          locale === "en" ? "Login successful!" : "உள்நுழைவு வெற்றிகரமாக!",
          "success"
        );
        
        // Fetch session to get user role and redirect accordingly
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        
        // Role-based redirect
        let finalRedirectUrl = redirectUrl;
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'DELIVERY') {
          finalRedirectUrl = '/admin/dashboard';
        } else {
          // Customer role - use default or provided redirect
          finalRedirectUrl = redirectUrl;
        }
        
        // Use window.location for hard redirect to ensure session is loaded
        setTimeout(() => {
          window.location.href = finalRedirectUrl;
        }, 500);
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

  // Handle Send OTP for Signup
  const handleSignupSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: signupPhone,
          action: 'signup'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error, "error");
        return;
      }

      showToast(
        locale === "en" 
          ? `OTP sent to ${signupPhone}` 
          : `${signupPhone} க்கு OTP அனுப்பப்பட்டது`,
        "success"
      );

      // Show dev OTP in development mode
      if (data.devOtp && process.env.NODE_ENV === 'development') {
        console.log("🔐 DEV OTP:", data.devOtp);
        showToast(`DEV MODE - OTP: ${data.devOtp}`, "info");
      }

      setSignupOtpExpiry(data.expiresIn || 300);
      setRemainingTime(data.expiresIn || 300);
      setSignupStep("otp");

      // Start countdown timer
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      showToast(
        locale === "en" ? "Failed to send OTP" : "OTP அனுப்ப முடியவில்லை",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP and Create Account
  const handleSignupVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: signupPhone,
          otp: signupOtp,
          action: 'signup',
          name: signupName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attemptsLeft !== undefined) {
          setSignupAttemptsLeft(data.attemptsLeft);
        }
        showToast(data.error, "error");
        return;
      }

      showToast(
        locale === "en"
          ? "Account created! Logging you in..."
          : "கணக்கு உருவாக்கப்பட்டது! உள்நுழைகிறது...",
        "success"
      );

      // Wait a moment before auto-login to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));

      // Auto-login after signup using the same OTP
      const loginResult = await signIn("otp", {
        phone: signupPhone,
        otp: signupOtp,
        redirect: false,
      });

      if (loginResult?.error) {
        console.error("Auto-login error:", loginResult.error);
        // If auto-login fails, switch to login tab
        setLoginPhone(signupPhone);
        setTab("login");
        setLoginStep("phone");
        showToast(
          locale === "en"
            ? "Account created! Please login to continue."
            : "கணக்கு உருவாக்கப்பட்டது! தொடர உள்நுழையவும்.",
          "info"
        );
        return;
      }

      if (loginResult?.ok) {
        // Fetch session to get user role
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        
        // Role-based redirect (new customers should be CUSTOMER role)
        let finalRedirectUrl = redirectUrl;
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'DELIVERY') {
          finalRedirectUrl = '/admin/dashboard';
        } else {
          finalRedirectUrl = redirectUrl;
        }
        
        setTimeout(() => {
          window.location.href = finalRedirectUrl;
        }, 500);
      }
    } catch {
      showToast(
        locale === "en" ? "Signup failed" : "பதிவு தோல்வியுற்றது",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset login flow
  const resetLoginFlow = () => {
    setLoginStep("phone");
    setLoginOtp("");
    setLoginAttemptsLeft(3);
  };

  // Reset signup flow
  const resetSignupFlow = () => {
    setSignupStep("phone");
    setSignupOtp("");
    setSignupAttemptsLeft(3);
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
              onClick={() => {
                setTab("login");
                resetLoginFlow();
              }}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
                tab === "login"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "en" ? "Login" : "உள்நுழைவு"}
            </button>
            <button
              onClick={() => {
                setTab("signup");
                resetSignupFlow();
              }}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
                tab === "signup"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {locale === "en" ? "Sign Up" : "பதிவு"}
            </button>
          </div>

          {/* LOGIN TAB */}
          {tab === "login" && (
            <div className="space-y-4">
              {loginStep === "phone" && (
                <form onSubmit={handleLoginSendOtp} className="space-y-4">
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
                  <button
                    type="submit"
                    disabled={loading || loginPhone.length !== 10}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? "We'll send you a one-time password"
                      : "உங்களுக்கு ஒரு முறை கடவுச்சொல் அனுப்பப்படும்"}
                  </p>
                </form>
              )}

              {loginStep === "otp" && (
                <form onSubmit={handleLoginVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {locale === "en" ? "Enter OTP" : "OTP உள்ளிடவும்"}
                    </label>
                    <input
                      type="text"
                      value={loginOtp}
                      onChange={(e) =>
                        setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="6-digit OTP"
                      className="w-full border rounded px-3 py-2 text-center text-2xl tracking-widest"
                      required
                      maxLength={6}
                      autoFocus
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {locale === "en"
                          ? `Attempts left: ${loginAttemptsLeft}`
                          : `மீதமுள்ள முயற்சிகள்: ${loginAttemptsLeft}`}
                      </p>
                      {remainingTime > 0 && (
                        <p className="text-xs text-gray-500">
                          {locale === "en" ? "Expires in: " : "காலாவதியாகும்: "}
                          <span className="font-semibold">{formatTime(remainingTime)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || loginOtp.length !== 6}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? locale === "en"
                        ? "Verifying..."
                        : "சரிபார்க்கிறது..."
                      : locale === "en"
                      ? "Verify & Login"
                      : "சரிபார்த்து உள்நுழையவும்"}
                  </button>
                  <button
                    type="button"
                    onClick={resetLoginFlow}
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← {locale === "en" ? "Change Phone Number" : "எண்ணை மாற்றவும்"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetLoginFlow();
                      handleLoginSendOtp(new Event('submit') as any);
                    }}
                    disabled={loading}
                    className="w-full text-sm text-orange-600 hover:underline disabled:opacity-50"
                  >
                    {locale === "en" ? "Resend OTP" : "OTP மீண்டும் அனுப்பவும்"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SIGNUP TAB */}
          {tab === "signup" && (
            <div className="space-y-4">
              {signupStep === "phone" && (
                <form onSubmit={handleSignupSendOtp} className="space-y-4">
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
                  <button
                    type="submit"
                    disabled={loading || signupPhone.length !== 10}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? "We'll verify your phone with an OTP"
                      : "OTP மூலம் உங்கள் தொலைபேசியை சரிபார்ப்போம்"}
                  </p>
                </form>
              )}

              {signupStep === "otp" && (
                <form onSubmit={handleSignupVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {locale === "en" ? "Enter OTP" : "OTP உள்ளிடவும்"}
                    </label>
                    <input
                      type="text"
                      value={signupOtp}
                      onChange={(e) =>
                        setSignupOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="6-digit OTP"
                      className="w-full border rounded px-3 py-2 text-center text-2xl tracking-widest"
                      required
                      maxLength={6}
                      autoFocus
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {locale === "en"
                          ? `Attempts left: ${signupAttemptsLeft}`
                          : `மீதமுள்ள முயற்சிகள்: ${signupAttemptsLeft}`}
                      </p>
                      {remainingTime > 0 && (
                        <p className="text-xs text-gray-500">
                          {locale === "en" ? "Expires in: " : "காலாவதியாகும்: "}
                          <span className="font-semibold">{formatTime(remainingTime)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || signupOtp.length !== 6}
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? locale === "en"
                        ? "Creating account..."
                        : "கணக்கை உருவாக்குகிறது..."
                      : locale === "en"
                      ? "Verify & Create Account"
                      : "சரிபார்த்து கணக்கை உருவாக்கவும்"}
                  </button>
                  <button
                    type="button"
                    onClick={resetSignupFlow}
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← {locale === "en" ? "Change Phone Number" : "எண்ணை மாற்றவும்"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetSignupFlow();
                      handleSignupSendOtp(new Event('submit') as any);
                    }}
                    disabled={loading}
                    className="w-full text-sm text-orange-600 hover:underline disabled:opacity-50"
                  >
                    {locale === "en" ? "Resend OTP" : "OTP மீண்டும் அனுப்பவும்"}
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
