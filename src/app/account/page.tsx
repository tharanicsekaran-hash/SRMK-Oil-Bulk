"use client";
import { useI18n } from "@/components/LanguageProvider";

export default function AccountPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">{t.account.title}</h1>
      <p className="text-gray-700 text-sm">Coming soon: {t.account.orders}</p>
      <div className="border rounded p-4 text-sm text-gray-600">
        <p>
          Login/registration and past orders will be added here. For now, you can place a sample order using COD in the
          checkout page.
        </p>
      </div>
    </div>
  );
}
