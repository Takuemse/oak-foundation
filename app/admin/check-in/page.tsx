"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, CheckCircle2, XCircle, AlertCircle, Phone } from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

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

const MOCK_SIMULATIONS = [
  {
    name: "Maria Schmidt",
    token: "OAK-2026-7842-XKPH",
    initials: "MS",
    role: "Partner",
    badgeBg: "bg-[#EEF1F9]",
    badgeBorder: "border-[#C5CFDF]",
    dotBg: "bg-[#1C2E5A]",
    textColor: "text-[#1C2E5A]",
  },
  {
    name: "James Odhiambo",
    token: "OAK-2026-1193-JWQA",
    initials: "JO",
    role: "OAK Staff",
    badgeBg: "bg-[#ECFDF5]",
    badgeBorder: "border-[#A7F3D0]",
    dotBg: "bg-[#10B981]",
    textColor: "text-[#065F46]",
  },
  {
    name: "Awa Diallo",
    token: "OAK-2026-3310-ADGE",
    initials: "AD",
    role: "Coordination Team",
    badgeBg: "bg-[#FFF7ED]",
    badgeBorder: "border-[#FED7AA]",
    dotBg: "bg-[#F97316]",
    textColor: "text-[#C2410C]",
  },
  {
    name: "Fatima Z. Benali",
    token: "OAK-2026-5592-FWBN",
    initials: "FZB",
    role: "Partner",
    badgeBg: "bg-[#EEF1F9]",
    badgeBorder: "border-[#C5CFDF]",
    dotBg: "bg-[#1C2E5A]",
    textColor: "text-[#1C2E5A]",
  },
];

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
          { fps: 10, qrbox: { width: 208, height: 208 } },
          (decodedText) => {
            if (isCleaningUp) return;
            submitCheckIn(decodedText);
          },
          () => {}
        );

        if (isCleaningUp) {
          await scanner.stop();
          scanner.clear();
        }
      } catch (err) {
        if (isCleaningUp) return;

        if (
          err instanceof DOMException &&
          (err.name === "AbortError" || err.name === "NotAllowedError")
        ) {
          return;
        }

        setCameraError(
          "Camera unavailable. Use manual entry or check browser permissions."
        );
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
            .catch(() => {});
        } else {
          try {
            html5QrcodeScanner.clear();
          } catch {
            // Container unmounted
          }
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

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex text-slate-800 font-sans">
      <style jsx global>{`
        #qr-reader {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          position: relative !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #qr-reader__scan_region {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        #qr-reader__scan_region img,
        #qr-reader__dashboard,
        #qr-reader__status_span,
        #qr-reader__shaded_region {
          display: none !important;
        }
        #qr-reader canvas {
          display: none !important;
        }
      `}</style>

      <AppSidebar />

      <main className="flex-1 w-full max-w-[672px] mx-auto px-4 py-8 sm:px-[32px] sm:py-[40px] flex flex-col items-start">
        {/* Header Section */}
        <div className="w-full max-w-[608px] flex flex-col items-start mb-5">
          <h1 className="font-chillax font-bold text-[24px] leading-[32px] text-[#0E1726]">
            Event Check-In
          </h1>
          <p className="font-sans font-normal text-[14px] leading-[20px] text-[#6B7590] mt-[4px]">
            Scan an attendee QR code to check them in
          </p>
        </div>

        {/* Scan Result Overlay States */}
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
            <div className="bg-white rounded-[20px] mt-3 p-5 border border-[rgba(28,46,90,0.1)]">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#0E1726] mb-3">
                <AlertCircle size={16} className="text-red-500" />
                Possible reasons
              </p>
              <ul className="text-xs text-[#6B7590] space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                  QR code belongs to a different event
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                  Registration was not completed
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                  Code has been altered or corrupted
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                  Attendee registered under a different email
                </li>
              </ul>
            </div>

            <a
              href="tel:+263000000000"
              className="mt-3 flex items-center justify-center gap-2 w-full bg-white border border-[rgba(28,46,90,0.15)] text-[#162E55] rounded-[16px] py-3 text-sm font-medium hover:bg-slate-50 transition shadow-sm"
            >
              <Phone size={15} />
              Contact Coordination Team
            </a>
          </ResultCard>
        )}

        {/* Primary Camera & Manual Entry Layout */}
        {!result && (
          <div className="w-full max-w-[608px] flex flex-col items-start space-y-[16px]">
            
            {/* Top Outer Container (Padding: 20px 0px 0px per spec) */}
            <div className="w-full pt-[20px] flex flex-col items-start">
              
              {/* Main Scanner Container (Width: 608px, Height: 673px auto-managed, Background: #0E1726, Radius: 24px) */}
              <div className="w-full bg-[#0E1726] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] flex flex-col items-start overflow-hidden relative">
                
                {/* Camera Viewport Container (608px x 608px Square Aspect Ratio) */}
                <div className="relative w-full aspect-square bg-[#0E1726] overflow-hidden flex items-center justify-center">
                  
                  {/* Html5Qrcode video canvas container */}
                  <div
                    key={SCANNER_ELEMENT_ID}
                    id={SCANNER_ELEMENT_ID}
                    className="absolute inset-0 z-0"
                  />

                  {/* Radial Background Overlay (70.71% radial, opacity 0.07) */}
                  <div
                    className="absolute inset-0 pointer-events-none z-10 opacity-[0.07]"
                    style={{
                      background:
                        "radial-gradient(70.71% 70.71% at 50% 50%, rgba(168, 187, 206, 0.8) 0.16%, rgba(0, 0, 0, 0) 0.16%)",
                    }}
                  />

                  {/* Centered Target Glow (211.66px x 211.66px, opacity 0.44) */}
                  <div
                    className="absolute z-10 pointer-events-none w-[211.66px] h-[211.66px] rounded-full opacity-[0.44]"
                    style={{
                      background:
                        "radial-gradient(70.71% 70.71% at 50% 50%, rgba(168, 187, 206, 0.12) 0%, rgba(168, 187, 206, 0) 70%)",
                    }}
                  />

                  {/* Reticle Frame Corner Markers */}
                  <div className="relative w-[208px] h-[208px] pointer-events-none z-20 flex items-center justify-center">
                    {/* Top-Left Corner (32px x 32px, Border #A8BBCE, Radius 12px) */}
                    <div className="absolute top-0 left-0 w-[32px] h-[32px] border-t-2 border-l-2 border-[#A8BBCE] rounded-tl-[12px]" />
                    {/* Top-Right Corner */}
                    <div className="absolute top-0 right-0 w-[32px] h-[32px] border-t-2 border-r-2 border-[#A8BBCE] rounded-tr-[12px]" />
                    {/* Bottom-Left Corner */}
                    <div className="absolute bottom-0 left-0 w-[32px] h-[32px] border-b-2 border-l-2 border-[#A8BBCE] rounded-bl-[12px]" />
                    {/* Bottom-Right Corner */}
                    <div className="absolute bottom-0 right-0 w-[32px] h-[32px] border-b-2 border-r-2 border-[#A8BBCE] rounded-br-[12px]" />
                  </div>

                  {/* Guidance Label */}
                  <p className="absolute z-20 pointer-events-none bottom-[20px] font-sans font-normal text-[12px] leading-[16px] tracking-[0.3px] text-[#A8BBCE]/50 text-center">
                    Position QR code within the frame
                  </p>

                  {cameraError && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center px-6 text-center bg-[#0E1726]/95">
                      <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Status Bar Container (Height: 65px, Border-Top: 1px solid rgba(255,255,255,0.1)) */}
                <div className="w-full h-[65px] px-[16px] py-[16px] gap-[12px] flex flex-row items-center border-t border-white/10 shrink-0 bg-[#0E1726]">
                  {/* Status Circle Badge (32px x 32px, bg rgba(255,255,255,0.1)) */}
                  <div className="w-[32px] h-[32px] rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <ScanLine size={14} className="text-[#A8BBCE]/70" />
                  </div>
                  
                  {/* Status Hint Text */}
                  <div className="flex flex-col items-start">
                    <span className="font-sans font-normal text-[12px] leading-[16px] text-[#A8BBCE]/45">
                      {loading ? "Checking in…" : "Hold camera steady · Auto-scans in 1–2 seconds"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Simulation Shortcuts */}
            <div className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] p-[20px] flex flex-col items-start">
              <span className="w-full font-sans font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] mb-[12px]">
                Simulate QR Scan
              </span>

              <div className="w-full flex flex-col items-start gap-[8px]">
                {MOCK_SIMULATIONS.map((item) => (
                  <button
                    key={item.token}
                    type="button"
                    onClick={() => submitCheckIn(item.token)}
                    disabled={loading}
                    className="w-full h-[62px] p-[12px] gap-[12px] border border-[rgba(28,46,90,0.1)] rounded-[16px] flex flex-row items-center hover:bg-slate-50 transition text-left shrink-0"
                  >
                    <div className="w-[36px] h-[36px] bg-[#162E55] rounded-[12px] flex items-center justify-center shrink-0">
                      <span className="font-sans font-bold text-[12px] leading-[16px] text-white">
                        {item.initials}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col items-start justify-center">
                      <span className="font-sans font-medium text-[14px] leading-[20px] text-[#0E1726]">
                        {item.name}
                      </span>
                      <span className="font-mono font-normal text-[10px] leading-[15px] text-[#6B7590]">
                        {item.token}
                      </span>
                    </div>

                    <div
                      className={`px-[10px] py-[4px] gap-[4px] flex flex-row items-center border rounded-[100px] shrink-0 ${item.badgeBg} ${item.badgeBorder}`}
                    >
                      <span className={`w-[6px] h-[6px] rounded-full ${item.dotBg}`} />
                      <span
                        className={`font-sans font-semibold text-[11px] leading-[16px] tracking-[0.22px] ${item.textColor}`}
                      >
                        {item.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Code Input Form */}
            <form
              onSubmit={handleManualSubmit}
              className="w-full bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] p-[20px] flex flex-col items-start"
            >
              <label className="w-full font-sans font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
                Manual Code Entry
              </label>

              <div className="w-full pt-[12px] flex flex-row items-center gap-[8px]">
                <div className="flex-1 h-[52.5px] px-4 bg-[#EEF1F5] rounded-[14px] flex items-center">
                  <input
                    type="text"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    placeholder="OAK-2026-XXXX-XXXX"
                    className="w-full bg-transparent font-sans font-normal text-[15px] leading-[18px] text-[#0E1726] placeholder-[#6B7590] focus:outline-none border-0 p-0"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !qrToken.trim()}
                  className="w-[90px] h-[52.5px] bg-[#162E55] shadow-[0px_4px_20px_rgba(28,46,90,0.3)] rounded-[16px] flex items-center justify-center font-chillax font-semibold text-[16px] leading-[24px] text-white hover:bg-[#0f213f] transition disabled:opacity-40"
                >
                  {loading ? "…" : "Check"}
                </button>
              </div>
            </form>

          </div>
        )}
      </main>
    </div>
  );
}

function ResultCard({ onDismiss, children }: { onDismiss: () => void; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[608px] mb-4">
      {children}
      <button
        onClick={onDismiss}
        className="mt-3 w-full bg-[#162E55] text-white rounded-[16px] py-3.5 text-sm font-chillax font-semibold shadow-[0px_4px_20px_rgba(28,46,90,0.25)] hover:bg-[#0f213f] transition"
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
  const isSuccess = tone === "success";
  const isWarning = tone === "warning";

  const bg = isSuccess
    ? "bg-emerald-600"
    : isWarning
    ? "bg-amber-500"
    : "bg-red-600";

  const label = isSuccess ? "Checked In" : isWarning ? "Already Checked In" : "Check-In Failed";

  return (
    <div className={`${bg} rounded-[24px] p-6 relative overflow-hidden text-white text-left shadow-sm`}>
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          {isSuccess || isWarning ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
        </div>
        <div>
          <span className="font-sans font-semibold text-[10px] leading-[14px] tracking-[1px] uppercase text-white/70">
            {label}
          </span>
          <h2 className="font-chillax font-bold text-[20px] leading-[26px] mt-0.5">{title}</h2>
          <p className="font-sans font-normal text-[12px] leading-[16px] text-white/80 mt-1">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function AttendeeSummary({ attendee }: { attendee: NonNullable<CheckInResult["attendee"]> }) {
  return (
    <div className="bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] mt-3 p-5 space-y-3 text-sm text-left shadow-sm">
      <Row label="Name" value={`${attendee.first_name} ${attendee.last_name}`} />
      <Row label="Organisation" value={attendee.organization_name ?? "—"} />
      <Row label="Role" value={attendee.role ?? "—"} />
      <Row label="Event Date" value={attendee.event_date} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
      <span className="font-sans font-normal text-[13px] text-[#6B7590]">{label}</span>
      <span className="font-sans font-medium text-[13px] text-[#0E1726] text-right">{value}</span>
    </div>
  );
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}