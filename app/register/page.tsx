"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";

type RegisterResponse = {
  success: boolean;
  message?: string;
  attendee?: {
    id: string;
    firstName: string;
    lastName: string;
    qrToken: string;
  };
};

const router = useRouter();

const ROLES = ["Partner",
   "OAK Staff", 
   "Coordination Team",
    "Presenter", 
    "Observer"];

    

export default function RegisterPage() {
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
      
      if (form.role === "Partner") {
       setResult(data.attendee);
       } else if (form.role === "Coordination Team") {
       router.push("/admin/check-in");
       } else {
       router.push("/dashboard");
      }

      setResult(data.attendee);
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
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-56 flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="px-5 pt-6 pb-4 border-b border-slate-100">
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              OAK <span className="font-normal text-slate-400">FOUNDATION</span>
            </div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 mt-1">
              Partner Convening 2026
            </div>
          </div>
          <nav className="px-3 py-4 space-y-1">
            <SidebarLink label="Register" href="/register" active />
            <SidebarLink label="Programme" href="/programme" />
            <SidebarLink label="Partners" href="/partners" />
            <SidebarLink label="Documentation" href="/documentation" />
          </nav>
        </div>
        <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100">
          Harare, Zimbabwe
          <br />
          9–11 November 2026
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        {result ? (
          <RegistrationSuccess attendee={result} onRegisterAnother={registerAnother} />
        ) : (
          <>
            <div className="bg-[#0f1e3d] text-white rounded-xl px-5 py-4 mb-4">
              <h1 className="text-lg font-semibold">Partner Convening 2026</h1>
              <p className="text-sm text-slate-300 mt-0.5">
                Harare · 9–11 November 2026
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <StatCard value="110+" label="Attendees" />
              <StatCard value="24" label="Sessions" />
              <StatCard value="38" label="Partners" />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">Registration Form</h2>

              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" required>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    required
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
                <select
                  required
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
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
                  placeholder="+263 xx xxx xx xx"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Requirements
                </h3>

                <Field label="Dietary Requirements">
                  <input
                    placeholder="e.g. Vegetarian, Halal, Gluten-free"
                    value={form.dietaryRequirements}
                    onChange={(e) => update("dietaryRequirements", e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Accessibility Requirements">
                  <input
                    placeholder="e.g. Wheelchair access, hearing loop"
                    value={form.accessibilityRequirements}
                    onChange={(e) => update("accessibilityRequirements", e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Travel & Accommodation">
                  <input
                    placeholder="e.g. Flight from London, hotel needed"
                    value={form.travelRequirements}
                    onChange={(e) => update("travelRequirements", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-500 pt-2">
                <input
                  type="checkbox"
                  checked={form.consentGiven}
                  onChange={(e) => update("consentGiven", e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I agree to OAK Foundation&apos;s privacy policy and consent to my
                  registration data being used for event coordination.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0f1e3d] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#16295c] transition disabled:opacity-50"
              >
                {loading ? "Registering…" : "Register & Generate QR Code"}
              </button>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                Your data is secured and handled by OAK Foundation in accordance
                with GDPR.
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1e3d]/20 focus:border-[#0f1e3d]";

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
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 py-3 text-center">
      <div className="text-sm font-semibold text-slate-800">{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function SidebarLink({
  label,
  href,
  active = false,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-sm font-medium ${
        active ? "bg-[#0f1e3d] text-white" : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
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
    <>
      <div className="bg-[#0f1e3d] text-white rounded-xl px-5 py-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm">
            ✓
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-300">
              Registration Complete
            </p>
            <h1 className="text-base font-semibold">
              You&apos;re Registered, {attendee.firstName}!
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center mb-4">
        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-3">
          Your Entry Pass
        </p>
        <div ref={canvasWrapperRef} className="flex justify-center mb-3">
          <QRCodeCanvas
            value={attendee.qrToken}
            size={200}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="M"
            marginSize={2}
          />
        </div>
        <p className="text-xs text-slate-500 font-mono">{attendee.qrToken}</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Present at event entrance for check-in
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 space-y-2 text-sm">
        <Row label="Name" value={`${attendee.firstName} ${attendee.lastName}`} />
        <Row label="Event Dates" value="9–11 November 2026" />
        <Row label="Location" value="Harare, Zimbabwe" />
      </div>

      <button
        onClick={handleDownload}
        className="w-full bg-[#0f1e3d] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#16295c] transition mb-3"
      >
        Download QR Code
      </button>

      <button
        onClick={onRegisterAnother}
        className="w-full border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition"
      >
        Register Another Attendee
      </button>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}