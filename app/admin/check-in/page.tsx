"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";

type CheckInResult = {
  success: boolean;
  message?: string;
  attendee?: {
    attendance_id: string;
    attendee_id: string;
    first_name: string;
    last_name: string;
    organization_name: string | null;
    role: string | null;
    event_date: string;
    checked_in_at: string;
    already_checked_in: boolean;
  };
};




const SCANNER_ELEMENT_ID = "qr-reader";

export default function CheckInPage() {
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isSubmittingRef = useRef(false);



  async function submitCheckIn(token: string) {
    if (!token.trim() || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: token.trim() }),
      });
      const data: CheckInResult = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: "Network error. Try again." });
    } finally {
      setLoading(false);
      setQrToken("");
      isSubmittingRef.current = false;
    }
  }

  

// Start the camera scanner whenever we're in the "no result" scanning view
useEffect(() => {
  if (result) return;

  let html5QrcodeScanner: Html5Qrcode | null = null;
  let isCleaningUp = false;

  const startScanner = async () => {
    const container = document.getElementById(SCANNER_ELEMENT_ID);
    if (!container) return;
    container.innerHTML = "";

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    html5QrcodeScanner = scanner;
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (isCleaningUp) return;
          console.log("[scanner] decoded:", JSON.stringify(decodedText));
          submitCheckIn(decodedText);
        },
        () => {
          // Frame error callback (ignored)
        }
      );

      if (isCleaningUp) {
        await scanner.stop();
        scanner.clear();
      }
    } catch (err) {
      if (isCleaningUp) return;

      if (err instanceof DOMException && err.name === "AbortError") {
        console.warn(
          "[scanner] Strict Mode double-invoke aborted an in-flight start — expected in dev."
        );
        return;
      }

      setCameraError(
        "Camera unavailable. Use manual code entry below, or check browser camera permissions."
      );
      console.error("Camera start error:", err);
    }
  };

  startScanner();

  return () => {
    isCleaningUp = true;
    if (html5QrcodeScanner) {
      if (html5QrcodeScanner.isScanning) {
        html5QrcodeScanner
          .stop()
          .then(() => html5QrcodeScanner?.clear())
          .catch((err) => console.error("Error stopping scanner", err));
      } else {
        html5QrcodeScanner.clear();
      }
    }
  };
}, [result]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitCheckIn(qrToken);
  }

  function reset() {
    setResult(null);
    setCameraError(null);
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
  <SidebarLink label="Check In" href="/admin/check-in" />
  <SidebarLink label="Attendance" href="/admin/attendance" />
  <SidebarLink label="Documentation" href="/admin/documentation" />
  <SidebarLink label="Partners" href="/admin/partners" />
</nav>
        </div>
        <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100">
          Harare, Zimbabwe
          <br />
          9–11 November 2026
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <div className="bg-[#0f1e3d] text-white rounded-xl px-5 py-4 mb-6">
          <h1 className="text-lg font-semibold">Event Check-In</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Scan an attendee QR code to check them in
          </p>
        </div>

        {result && result.success && result.attendee && !result.attendee.already_checked_in && (
          <ResultCard onDismiss={reset}>
            <ResultHeader
              tone="success"
              title="Checked In Successfully"
              subtitle={formatTimestamp(result.attendee.checked_in_at)}
            />
            <AttendeeSummary attendee={result.attendee} />
          </ResultCard>
        )}

        {result && result.success && result.attendee && result.attendee.already_checked_in && (
          <ResultCard onDismiss={reset}>
            <ResultHeader
              tone="warning"
              title="Already Checked In"
              subtitle={`First checked in at ${formatTimestamp(result.attendee.checked_in_at)}`}
            />
            <AttendeeSummary attendee={result.attendee} />
          </ResultCard>
        )}

        {result && !result.success && (
          <ResultCard onDismiss={reset}>
            <ResultHeader
              tone="error"
              title="QR Not Recognised"
              subtitle={result.message ?? "Code is invalid or unregistered"}
            />
            <ul className="text-sm text-slate-500 mt-3 space-y-1 list-disc list-inside">
              <li>QR code belongs to a different event</li>
              <li>Registration was not completed</li>
              <li>Code has been altered or corrupted</li>
              <li>Attendee registered under a different email</li>
            </ul>
          </ResultCard>
        )}

        {!result && (
          <>
            <div className="bg-[#0f1e3d] rounded-xl overflow-hidden relative mb-4">
              <div key={SCANNER_ELEMENT_ID} id={SCANNER_ELEMENT_ID} className="w-full aspect-[4/3]" />

              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <p className="text-xs text-slate-300">{cameraError}</p>
                </div>
              )}

              <p className="text-center text-xs text-slate-400 py-3">
                {loading
                  ? "Checking in…"
                  : "Hold camera steady · Auto-scans in 1–2 seconds"}
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="bg-white rounded-xl border border-slate-200 p-4">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Manual Code Entry
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  placeholder="OAK-2026-XXXX-XXXX or QR token"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1e3d]/20 focus:border-[#0f1e3d]"
                />
                <button
                  type="submit"
                  disabled={loading || !qrToken.trim()}
                  className="bg-[#0f1e3d] text-white rounded-lg px-5 py-2 text-sm font-medium disabled:opacity-40 hover:bg-[#16295c] transition"
                >
                  {loading ? "…" : "Check"}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

function SidebarLink({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
        active ? "bg-[#0f1e3d] text-white" : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {label}
    </div>
  );
}

function ResultCard({ onDismiss, children }: { onDismiss: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
      {children}
      <button
        onClick={onDismiss}
        className="mt-4 w-full border border-slate-200 text-slate-600 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition"
      >
        Scan Next Attendee
      </button>
    </div>
  );
}

function ResultHeader({
  tone,
  title,
  subtitle,
}: {
  tone: "success" | "warning" | "error";
  title: string;
  subtitle: string;
}) {
  const styles = {
    success: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "✓" },
    warning: { bg: "bg-amber-50", text: "text-amber-700", icon: "ⓘ" },
    error: { bg: "bg-red-50", text: "text-red-700", icon: "✕" },
  }[tone];

  return (
    <div className={`${styles.bg} ${styles.text} rounded-lg px-4 py-3 flex items-start gap-3`}>
      <span className="text-lg leading-none">{styles.icon}</span>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs opacity-80 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}

function AttendeeSummary({ attendee }: { attendee: NonNullable<CheckInResult["attendee"]> }) {
  return (
    <div className="mt-4 space-y-2 text-sm">
      <Row label="Name" value={`${attendee.first_name} ${attendee.last_name}`} />
      <Row label="Organization" value={attendee.organization_name ?? "—"} />
      <Row label="Role" value={attendee.role ?? "—"} />
      <Row label="Event Date" value={attendee.event_date} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}