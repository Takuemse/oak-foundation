"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(
        "Unable to reset password. Your reset link may have expired — request a new one."
      );
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/admin/check-in"), 1500);
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <div className="relative w-[100px] h-[62px] mb-6">
          <Image
            src="/Logo-Oak-Foundation.svg.svg"
            alt="Oak Foundation Logo"
            fill
            priority
            className="object-contain"
          />
        </div>

        <div className="w-full bg-white rounded-[24px] p-8 shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] border border-[rgba(28,46,90,0.1)]">
          <h1 className="font-chillax font-bold text-[22px] leading-[28px] text-[#0E1726] text-center">
            Set New Password
          </h1>

          {done ? (
            <p className="font-['Inter'] text-[14px] text-[#6B7590] text-center mt-6">
              Password updated. Redirecting you in…
            </p>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 text-xs rounded-xl px-4 py-3 border border-red-100 mt-4 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
                <div className="flex flex-col gap-[6px]">
                  <label className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[48px] rounded-[14px] bg-[#EEF1F5] px-4 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
                  />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <label className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[48px] rounded-[14px] bg-[#EEF1F5] px-4 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] mt-2 text-white rounded-[16px] font-chillax font-semibold text-[15px] disabled:opacity-50 shadow-[0px_4px_20px_rgba(28,46,90,0.3)] hover:opacity-95"
                  style={{ background: "linear-gradient(135deg, #1C2E5A 0%, #2D4A82 100%)" }}
                >
                  {loading ? "Saving…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}