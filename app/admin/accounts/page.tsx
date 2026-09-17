"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, UserPlus, ShieldAlert, Copy, Check } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";

type Tier = "admin" | "super_admin" | null;

type Account = {
  id: string;
  email: string;
  role: "admin" | "super_admin";
  createdAt: string;
};

export default function AdminAccountsPage() {
  const [tier, setTier] = useState<Tier>(null);
  const [checking, setChecking] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string; role: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setTier(data.success ? data.tier : null))
      .finally(() => setChecking(false));
  }, []);

  function loadAccounts() {
    setLoadingAccounts(true);
    fetch("/api/admin/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAccounts(data.accounts ?? []);
      })
      .finally(() => setLoadingAccounts(false));
  }

  useEffect(() => {
    if (tier === "super_admin") loadAccounts();
  }, [tier]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setCreated(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();

      if (!data.success) {
        setFormError(data.message ?? "Unable to create account.");
        return;
      }

      setCreated({ email, password, role });
      setEmail("");
      setPassword("");
      setRole("admin");
      loadAccounts();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyCredentials() {
    if (!created) return;
    navigator.clipboard.writeText(
      `Email: ${created.email}\nPassword: ${created.password}\nSign in at: /admin/login`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-['Inter'] text-[14px] text-[#6B7590]">Loading…</p>
        </div>
      </div>
    );
  }

  if (tier !== "super_admin") {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
        <AdminSidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-14 h-14 rounded-[16px] bg-[#EEF1F5] flex items-center justify-center text-[#6B7590]">
            <ShieldAlert size={24} strokeWidth={1.75} />
          </div>
          <p className="font-['Inter'] font-semibold text-[16px] text-[#0E1726]">
            Lead Organizer access required
          </p>
          <p className="font-['Inter'] text-[14px] text-[#6B7590] max-w-[340px]">
            Only Lead Organizers can create or view admin accounts.
          </p>
          <Link
            href="/admin/check-in"
            className="px-5 py-3 bg-[#162E55] text-white rounded-[16px] font-['Inter'] font-semibold text-[14px] hover:bg-[#1c3a6b] transition"
          >
            Go to Check In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
      <AdminSidebar />

      <div className="flex-1 flex justify-center">
        <main className="w-full max-w-full md:max-w-[672px] mx-auto min-h-screen px-4 pt-6 pb-10 md:px-8 md:py-10 flex flex-col items-start gap-[16px]">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            <ChevronLeft className="w-4 h-4 text-[#1C2E5A]" />
            <span className="font-['Inter'] font-semibold text-[14px] text-[#1C2E5A] group-hover:underline">
              Dashboard
            </span>
          </Link>

          <div className="w-full flex flex-col items-start">
            <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
              Admin Accounts
            </h1>
            <p className="font-['Inter'] text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              Create Coordination Team and Lead Organizer sign-ins
            </p>
          </div>

          {/* Create account form */}
          <form
            onSubmit={handleCreate}
            className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-5 flex flex-col gap-3"
          >
            <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
              New Account
            </span>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[12px] px-3 py-2.5">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-['Inter'] font-semibold text-[11px] uppercase tracking-[0.3px] text-[#6B7590]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@oakfnd.org"
                  className="h-[44px] rounded-[12px] bg-[#EEF1F5] px-3 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-['Inter'] font-semibold text-[11px] uppercase tracking-[0.3px] text-[#6B7590]">
                  Temporary Password
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-[44px] rounded-[12px] bg-[#EEF1F5] px-3 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-['Inter'] font-semibold text-[11px] uppercase tracking-[0.3px] text-[#6B7590]">
                Tier
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 h-[44px] rounded-[12px] font-['Inter'] font-semibold text-[13px] transition ${
                    role === "admin" ? "bg-[#162E55] text-white" : "bg-[#EEF1F5] text-[#6B7590]"
                  }`}
                >
                  Coordination Team
                </button>
                <button
                  type="button"
                  onClick={() => setRole("super_admin")}
                  className={`flex-1 h-[44px] rounded-[12px] font-['Inter'] font-semibold text-[13px] transition ${
                    role === "super_admin" ? "bg-[#162E55] text-white" : "bg-[#EEF1F5] text-[#6B7590]"
                  }`}
                >
                  Lead Organizer
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 h-[48px] mt-1 bg-[#162E55] text-white rounded-[14px] font-chillax font-semibold text-[14px] shadow-[0px_4px_10px_rgba(28,46,90,0.3)] hover:opacity-95 disabled:opacity-50 transition"
            >
              <UserPlus size={16} />
              {submitting ? "Creating…" : "Create Account"}
            </button>
          </form>

          {created && (
            <div className="w-full bg-[#ECFDF5] border border-[#A7F3D0] rounded-[20px] p-4 flex flex-col gap-2">
              <p className="font-['Inter'] font-semibold text-[13px] text-[#065F46]">
                Account created — share these credentials securely
              </p>
              <p className="font-['Inter'] text-[13px] text-[#065F46]">
                {created.email} · {created.password} · {created.role === "super_admin" ? "Lead Organizer" : "Coordination Team"}
              </p>
              <p className="font-['Inter'] text-[12px] text-[#065F46]/80">
                This password won't be shown again. The new admin should sign
                in at <span className="font-semibold">/admin/login</span> and
                use "Forgot password?" to set their own.
              </p>
              <button
                type="button"
                onClick={copyCredentials}
                className="self-start flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-white border border-[#A7F3D0] rounded-[10px] font-['Inter'] font-semibold text-[12px] text-[#065F46] hover:bg-[#F0FDF9] transition"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy details"}
              </button>
            </div>
          )}

          {/* Existing accounts */}
          <div className="w-full flex flex-col items-start gap-3 pt-2">
            <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
              Existing Accounts
            </span>

            {loadingAccounts ? (
              <p className="font-['Inter'] text-[13px] text-[#6B7590]">Loading…</p>
            ) : accounts.length === 0 ? (
              <p className="font-['Inter'] text-[13px] text-[#6B7590]">No accounts yet.</p>
            ) : (
              <div className="w-full flex flex-col gap-2">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="w-full bg-white border border-[rgba(28,46,90,0.1)] rounded-[16px] px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <span className="font-['Inter'] text-[13px] text-[#0E1726] truncate">{acc.email}</span>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full font-['Inter'] font-semibold text-[11px] ${
                        acc.role === "super_admin"
                          ? "bg-[#EEF1F9] text-[#1C2E5A]"
                          : "bg-[#EEF1F5] text-[#6B7590]"
                      }`}
                    >
                      {acc.role === "super_admin" ? "Lead Organizer" : "Coordination Team"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}