"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError("Unable to send reset email. Please try again.");
      return;
    }
    setSent(true);
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
            Reset Password
          </h1>

          {sent ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <p className="font-['Inter'] text-[14px] text-[#6B7590]">
                If an admin account exists for <strong className="text-[#0E1726]">{email}</strong>,
                a reset link has been sent. Check your inbox and spam folder.
              </p>
              <Link
                href="/admin/login"
                className="font-['Inter'] text-[13px] text-[#162E55] underline mt-2"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="font-['Inter'] text-[13px] leading-[18px] text-[#6B7590] text-center mt-1 mb-6">
                Enter your admin email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-50 text-red-700 text-xs rounded-xl px-4 py-3 border border-red-100 mb-4 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@oakfnd.org"
                  className="w-full h-[48px] rounded-[14px] bg-[#EEF1F5] px-4 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] text-white rounded-[16px] font-chillax font-semibold text-[15px] disabled:opacity-50 shadow-[0px_4px_20px_rgba(28,46,90,0.3)] hover:opacity-95"
                  style={{ background: "linear-gradient(135deg, #1C2E5A 0%, #2D4A82 100%)" }}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <Link
                href="/admin/login"
                className="block text-center font-['Inter'] text-[13px] text-[#6B7590] hover:text-[#162E55] mt-4"
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}