"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/LanguageProvider";
import { useToast } from "@/store/toast";

type AuthStep = "phone" | "otp";

function AuthContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { locale } = useI18n();
  const showToast = useToast((s) => s.show);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [otp, setOtp] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // Timer for OTP expiry display
  const [remainingTime, setRemainingTime] = useState(0);

  const startTimer = (expiresInSeconds: number) => {
    setRemainingTime(expiresInSeconds || 300);
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: name.trim() || undefined,
          action: "auth",
        }),
      });

      const data = await response.json();

      if (response.status === 428 && data?.requiresName) {
        setNeedsName(true);
        showToast(
          locale === "en" ? "Please enter your name to continue" : "தொடர உங்கள் பெயரை உள்ளிடவும்",
          "info"
        );
        return;
      }

      if (!response.ok) {
        showToast(data.error, "error");
        return;
      }

      showToast(
        locale === "en"
          ? `OTP sent to ${phone}`
          : `${phone} க்கு OTP அனுப்பப்பட்டது`,
        "success"
      );

      if (data.devOtp && process.env.NODE_ENV === "development") {
        console.log("🔐 DEV OTP:", data.devOtp);
        showToast(`DEV MODE - OTP: ${data.devOtp}`, "info");
      }

      setNeedsName(false);
      setStep("otp");
      startTimer(data.expiresIn || 300);
    } catch {
      showToast(
        locale === "en" ? "Failed to send OTP" : "OTP அனுப்ப முடியவில்லை",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("otp", {
        phone,
        otp,
        redirect: false,
      });

      if (result?.error) {
        showToast(result.error, "error");
        setAttemptsLeft((prev) => prev - 1);
      } else if (result?.ok) {
        showToast(
          locale === "en" ? "Login successful!" : "உள்நுழைவு வெற்றிகரமாக!",
          "success"
        );

        const sessionResponse = await fetch("/api/auth/session");
        const session = await sessionResponse.json();

        let finalRedirectUrl = redirectUrl;
        if (session?.user?.role === "ADMIN" || session?.user?.role === "DELIVERY") {
          finalRedirectUrl = "/admin/dashboard";
        }

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

  // Helper to format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetFlow = () => {
    setStep("phone");
    setOtp("");
    setNeedsName(false);
    setAttemptsLeft(3);
    setRemainingTime(0);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md border p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center">
            {locale === "en" ? "My Account" : "எனது கணக்கு"}
          </h1>

          {step === "phone" && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {locale === "en" ? "Phone Number" : "தொலைபேசி எண்"}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10 digits"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              {needsName && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {locale === "en" ? "Name" : "பெயர்"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={locale === "en" ? "Your name" : "உங்கள் பெயர்"}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading || phone.length !== 10 || (needsName && !name.trim())}
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
                  ? "Existing users login with OTP. New users are created automatically."
                  : "ஏற்கனவே உள்ள பயனர்கள் OTP மூலம் உள்நுழையலாம். புதிய பயனர்கள் தானாக உருவாக்கப்படுவர்."}
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={verifyAndLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {locale === "en" ? "Enter OTP" : "OTP உள்ளிடவும்"}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="w-full border rounded px-3 py-2 text-center text-2xl tracking-widest"
                  required
                  maxLength={6}
                  autoFocus
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {locale === "en"
                      ? `Attempts left: ${attemptsLeft}`
                      : `மீதமுள்ள முயற்சிகள்: ${attemptsLeft}`}
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
                disabled={loading || otp.length !== 6}
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
                onClick={resetFlow}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                ← {locale === "en" ? "Change Phone Number" : "எண்ணை மாற்றவும்"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await sendOtp({ preventDefault: () => {} } as React.FormEvent);
                }}
                disabled={loading}
                className="w-full text-sm text-orange-600 hover:underline disabled:opacity-50"
              >
                {locale === "en" ? "Resend OTP" : "OTP மீண்டும் அனுப்பவும்"}
              </button>
            </form>
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
