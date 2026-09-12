"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppSidebar from "@/app/components/AppSidebar";

type RegisterResponse = {
  success: boolean;
  message?: string;
  attendee?: {
    id: string;
    firstName: string;
    lastName: string;
    qrToken: string;
    organizationName?: string;
    role?: string;
    email?: string;
  };
};

const ROLES = ["Partner", "OAK Staff", "Coordination Team", "Presenter", "Observer"];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    organizationName: "",
    subPartner: "",
    role: "",
    email: "",
    phone: "",
    dietaryRequirements: "",
    accessibilityRequirements: "",
    travelRequirements: "",
    consentGiven: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResponse["attendee"] | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.role) {
      setError("Please select a role to continue.");
      return;
    }

    if (!form.consentGiven) {
      setError("Please agree to the privacy policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: RegisterResponse = await res.json();

      if (!data.success || !data.attendee) {
        setError(data.message ?? "Registration failed. Please try again.");
        return;
      }
      sessionStorage.setItem("oak_registered", "true");
      sessionStorage.setItem("oak_role", data.attendee.role ?? form.role);
      window.dispatchEvent(new Event("oak-registration-changed"));
      
      if (form.role === "Partner") {
        setResult(data.attendee);
      } else if (form.role === "Coordination Team") {
        router.push("/admin/check-in");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function registerAnother() {
    setResult(null);
    setError(null);
    setForm({
      firstName: "",
      lastName: "",
      organizationName: "",
      subPartner: "",
      role: "",
      email: "",
      phone: "",
      dietaryRequirements: "",
      accessibilityRequirements: "",
      travelRequirements: "",
      consentGiven: false,
    });
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row text-slate-800 font-sans">
      
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      
      <header className="md:hidden w-full h-[82px] bg-[#162E55] px-4 pt-[38px] pb-[16px] flex items-center justify-center gap-[12px] shrink-0">
        <div className="relative w-[50px] h-[28px] shrink-0 flex items-center justify-center">
          <Image
            src="/Logo-Oak-Foundation.svg.svg"
            alt="Oak Foundation Logo"
            fill
            priority
            className="object-contain brightness-0 invert"
          />
        </div>
        <div className="w-[1px] h-[20px] bg-white/20 shrink-0" />
        <span className="font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] tracking-[0.3px] uppercase text-white/70 truncate">
          Partner Convening 2026
        </span>
      </header>

      
      <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-full md:max-w-[672px] mx-auto w-full flex flex-col gap-4">
        {result ? (
          <RegistrationSuccess attendee={result} onRegisterAnother={registerAnother} />
        ) : (
          <>
          
            <div className="relative overflow-hidden w-full h-[167px] bg-[#162E55] rounded-[24px] p-6 shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] flex flex-col justify-between">
              <div
                className="pointer-events-none absolute w-[192px] h-[192px] -right-[26px] -top-[40px] rounded-full"
                style={{
                  background:
                    "radial-gradient(70.71% 70.71% at 50% 50%, rgba(168, 187, 206, 0.2) 0%, rgba(168, 187, 206, 0) 70%)",
                }}
              />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <h1 className="font-['Chillax',sans-serif] font-bold text-[28px] md:text-[30px] leading-[34px] md:leading-[37.5px] tracking-[0px] text-white pt-1">
                  Partner <br />
                  Convening 2026
                </h1>
                <p className="font-['Inter',sans-serif] font-normal text-[14px] leading-[20px] tracking-[0px] text-white/50">
                  Harare, Zimbabwe · 9–11 November 2026
                </p>
              </div>
            </div>

      
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
              <StatCard
                value="110+"
                label="Attendees"
                icon={
                  <svg className="w-4 h-4 text-[#A8BBCE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <StatCard
                value="24"
                label="Sessions"
                icon={
                  <svg className="w-4 h-4 text-[#A8BBCE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <StatCard
                value="38"
                label="Partners"
                icon={
                  <svg className="w-4 h-4 text-[#A8BBCE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs rounded-xl px-4 py-3 border border-red-100">
                {error}
              </div>
            )}

      
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white rounded-[24px] p-4 sm:p-5 shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] border border-[rgba(28,46,90,0.1)] flex flex-col gap-4 text-left"
            >
              <h2 className="font-['Chillax',sans-serif] font-semibold text-[18px] leading-[28px] tracking-[0px] text-[#0E1726]">
                Registration Form
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="First Name" required>
                  <input
                    required
                    placeholder="Maria"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    required
                    placeholder="Schmidt"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Organisation" required>
                <input
                  required
                  placeholder="Your organisation name"
                  value={form.organizationName}
                  onChange={(e) => update("organizationName", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Sub-Partner / Programme Area">
                <input
                  placeholder="Optional"
                  value={form.subPartner}
                  onChange={(e) => update("subPartner", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Role / Capacity" required>
                <CustomRoleDropdown
                  value={form.role}
                  onChange={(role) => update("role", role)}
                />
              </Field>

              <Field label="Email Address" required>
                <input
                  required
                  type="email"
                  placeholder="you@organisation.org"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Phone Number">
                <input
                  type="tel"
                  placeholder="+41 xx xxx xx xx"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputClass}
                />
              </Field>

              {/* Requirements Group */}
              <div className="bg-[#EEF1F5] rounded-[16px] p-4 border border-[rgba(28,46,90,0.1)] flex flex-col gap-3">
                <span className="font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase">
                  Requirements
                </span>

                <Field label="Dietary Requirements">
                  <input
                    placeholder="e.g. Vegetarian, Halal, Gluten-free"
                    value={form.dietaryRequirements}
                    onChange={(e) => update("dietaryRequirements", e.target.value)}
                    className={inputClassWhite}
                  />
                </Field>

                <Field label="Accessibility Requirements">
                  <input
                    placeholder="e.g. Wheelchair access, hearing loop"
                    value={form.accessibilityRequirements}
                    onChange={(e) => update("accessibilityRequirements", e.target.value)}
                    className={inputClassWhite}
                  />
                </Field>

                <Field label="Travel & Accommodation">
                  <input
                    placeholder="e.g. Flight from London, hotel needed"
                    value={form.travelRequirements}
                    onChange={(e) => update("travelRequirements", e.target.value)}
                    className={inputClassWhite}
                  />
                </Field>
              </div>

      
              <label className="flex items-start gap-3 p-4 border border-[rgba(28,46,90,0.18)] rounded-[16px] cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={form.consentGiven}
                  onChange={(e) => update("consentGiven", e.target.checked)}
                  className="mt-1 w-[20px] h-[20px] rounded-[6px] border border-[rgba(28,46,90,0.18)] text-[#162E55] focus:ring-[#162E55] accent-[#162E55] shrink-0"
                />
                <span className="font-['Inter',sans-serif] font-normal text-[14px] leading-[22.75px] tracking-[0px] text-[#0E1726]">
                  I agree to OAK Foundation&apos;s{" "}
                  <a href="#" className="font-['Inter',sans-serif] font-normal text-[14px] leading-[22.75px] tracking-[0px] underline decoration-solid decoration-[0%] underline-offset-[0%] text-[#0E1726] hover:text-[#162E55]">
                    privacy policy
                  </a>{" "}
                  and consent to my registration data being used for event coordination.
                </span>
              </label>

      
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[56px] text-white rounded-[16px] font-['Chillax',sans-serif] font-semibold text-[16px] leading-[24px] tracking-[0px] text-center transition duration-150 disabled:opacity-50 flex items-center justify-center shadow-[0px_4px_20px_rgba(28,46,90,0.3)] hover:opacity-95"
                style={{
                  background: "linear-gradient(135deg, #1C2E5A 0%, #2D4A82 100%)",
                }}
              >
                {loading ? "Registering…" : "Register"}
              </button>
            </form>

            <footer className="w-full py-4 flex flex-col items-center">
              <p className="font-['Inter',sans-serif] font-normal text-[12px] leading-[16px] tracking-[0px] text-center text-[#6B7590] max-w-[371px]">
                Your data is secured and handled by OAK Foundation in accordance with GDPR.
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

const inputClass =
  "w-full h-[52.5px] rounded-[14px] bg-[#EEF1F5] px-4 font-['Inter',sans-serif] font-normal text-[15px] leading-[100%] tracking-[0px] text-[#0E1726] placeholder-[#6B7590] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 transition border-0";

const inputClassWhite =
  "w-full h-[52.5px] rounded-[14px] bg-white px-4 font-['Inter',sans-serif] font-normal text-[15px] leading-[100%] tracking-[0px] text-[#0E1726] placeholder-[#6B7590] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 transition border-0";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      <div className="flex items-center gap-1 font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase">
        <span>{label}</span>
        {required && <span className="text-[#FB2C36] font-['Inter',sans-serif]">*</span>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 h-full shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] flex flex-col justify-between text-left border border-[rgba(28,46,90,0.1)]">
      <div>{icon}</div>
      <div className="mt-2">
        <div className="font-['Chillax',sans-serif] font-bold text-[20px] leading-[20px] tracking-[0px] text-[#0E1726]">
          {value}
        </div>
        <div className="font-['Inter',sans-serif] font-normal text-[12px] leading-[16px] tracking-[0px] text-[#6B7590] mt-0.5 truncate">
          {label}
        </div>
      </div>
    </div>
  );
}

function CustomRoleDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (role: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${inputClass} flex items-center justify-between text-left transition`}
      >
        <span className={value ? "text-[#0E1726]" : "text-[#6B7590]"}>
          {value || "Select your role"}
        </span>
        <svg
          className={`w-[14px] h-[14px] text-[#6B7590] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.16"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-[15px] p-3.5 shadow-[0px_3px_12px_rgba(0,0,0,0.15)] border border-slate-100 z-50 flex flex-col gap-1.5 animate-in fade-in duration-100">
          <div className="w-full h-[30px] px-[10px] py-[3px] bg-[#162E55] rounded-[5px] flex items-center shrink-0">
            <span className="font-['Inter',sans-serif] font-normal text-[15px] leading-[22px] text-white">
              Select your role
            </span>
          </div>

          <div className="flex flex-col w-full">
            {ROLES.map((role) => {
              const isSelected = value === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onChange(role);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-[10px] py-[4px] rounded transition-colors duration-100 font-['Inter',sans-serif] font-normal text-[15px] leading-[22px] ${
                    isSelected
                      ? "bg-[#EEF1F5] text-[#162E55] font-medium"
                      : "text-[#0E1726] hover:bg-slate-50 hover:text-[#162E55]"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationSuccess({
  attendee,
  onRegisterAnother,
}: {
  attendee: NonNullable<RegisterResponse["attendee"]>;
  onRegisterAnother: () => void;
}) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const originalCanvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!originalCanvas) return;

    const padding = 32;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = originalCanvas.width + padding * 2;
    exportCanvas.height = originalCanvas.height + padding * 2;

    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(originalCanvas, padding, padding);

    const url = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `oak-entry-pass-${attendee.firstName.toLowerCase()}-${attendee.lastName.toLowerCase()}.png`;
    link.click();
  }

  return (
    <div className="w-full flex flex-col gap-4 text-left">
      <div className="w-full bg-[#162E55] text-white rounded-[24px] p-6 shadow-[0px_4px_16px_rgba(28,46,90,0.07)] flex items-center gap-4">
        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-white/60 uppercase">
            Registration Complete
          </span>
          <h1 className="font-['Chillax',sans-serif] font-bold text-[22px] leading-[28px] text-white mt-0.5">
            You&apos;re Registered, <br />
            {attendee.firstName}!
          </h1>
          {attendee.email && (
            <span className="font-['Inter',sans-serif] font-normal text-[12px] leading-[18px] text-white/50 mt-1 truncate max-w-[220px] sm:max-w-none">
              {attendee.email}
            </span>
          )}
        </div>
      </div>

      <div className="w-full bg-white rounded-[24px] p-6 sm:p-8 shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] border border-[rgba(28,46,90,0.1)] flex flex-col items-center text-center">
        <span className="font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase mb-6">
          Your Entry Pass
        </span>

        <div ref={canvasWrapperRef} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-5 max-w-full overflow-hidden">
          <QRCodeCanvas
            value={attendee.qrToken}
            size={180}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="H"
            marginSize={4}
          />
        </div>

        <span className="font-mono font-medium text-[12px] sm:text-[13px] leading-[18px] text-[#6B7590] tracking-wider uppercase mb-1 break-all">
          {attendee.qrToken}
        </span>
        <span className="font-['Inter',sans-serif] font-normal text-[12px] leading-[16px] text-[#A0AEC0]">
          Present at event entrance for check-in
        </span>

      </div>

      <div className="w-full bg-white rounded-[24px] p-6 shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] border border-[rgba(28,46,90,0.1)] flex flex-col gap-4">
        <span className="font-['Inter',sans-serif] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase">
          Registration Details
        </span>

        <div className="flex flex-col gap-3">
          <DetailRow label="Name" value={`${attendee.firstName} ${attendee.lastName}`} />
          <DetailRow label="Organisation" value={attendee.organizationName || "—"} />
          <DetailRow label="Role" value={attendee.role || "—"} />
          <DetailRow label="Email" value={attendee.email || "—"} />
          <DetailRow label="Event Dates" value="9–11 November 2026" />
          <DetailRow label="Location" value="Harare, Zimbabwe" />
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full h-[52px] text-white rounded-[16px] font-['Chillax',sans-serif] font-semibold text-[15px] leading-[22px] transition duration-150 flex items-center justify-center gap-2 shadow-[0px_4px_20px_rgba(28,46,90,0.25)] hover:opacity-95"
        style={{ background: "linear-gradient(135deg, #1C2E5A 0%, #2D4A82 100%)" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        Download QR Code
      </button>

      <button
        onClick={onRegisterAnother}
        className="w-full py-2 text-center font-['Inter',sans-serif] font-medium text-[13px] leading-[18px] text-[#6B7590] hover:text-[#162E55] transition flex items-center justify-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Register another attendee
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 last:pb-0 gap-2">
      <span className="font-['Inter',sans-serif] font-normal text-[13px] leading-[18px] text-[#6B7590] shrink-0">
        {label}
      </span>
      <span className="font-['Inter',sans-serif] font-medium text-[13px] leading-[18px] text-[#0E1726] text-right truncate">
        {value}
      </span>
    </div>
  );
}