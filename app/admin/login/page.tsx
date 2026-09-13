"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/app/lib/superbase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/admin/check-in");
    router.refresh();
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
            Admin Sign In
          </h1>
          <p className="font-['Inter'] text-[13px] leading-[18px] text-[#6B7590] text-center mt-1 mb-6">
            Partner Convening 2026 · Coordination Access
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs rounded-xl px-4 py-3 border border-red-100 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-[6px]">
              <label className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@oakfnd.org"
                className="w-full h-[48px] rounded-[14px] bg-[#EEF1F5] px-4 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center justify-between">
                <label className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="font-['Inter'] text-[12px] text-[#6B7590] hover:text-[#162E55] underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-[48px] rounded-[14px] bg-[#EEF1F5] px-4 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] mt-2 text-white rounded-[16px] font-chillax font-semibold text-[15px] leading-[22px] transition duration-150 disabled:opacity-50 flex items-center justify-center shadow-[0px_4px_20px_rgba(28,46,90,0.3)] hover:opacity-95"
              style={{ background: "linear-gradient(135deg, #1C2E5A 0%, #2D4A82 100%)" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="font-['Inter'] text-[12px] text-[#A0AEC0] mt-6 text-center max-w-[320px]">
          Coordination Team and Partner Management access only.
        </p>
      </div>
    </div>
  );
}