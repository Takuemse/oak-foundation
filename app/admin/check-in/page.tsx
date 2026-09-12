"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

   const scannerRef = useRef<Html5Qrcode | null>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const role = sessionStorage.getItem("oak_role");
    if (role !== "Coordination Team") {
      router.replace("/register");
      return;
    }
    setRoleChecked(true);
  }, [router]);

  async function submitCheckIn(token: string) {
    if (!token.trim() || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setResult(null);

    // Safely stop scanner prior to network request/result view swap
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Suppress teardown race conditions
      }
    }

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

  // Camera initialization effect
   useEffect(() => {
    if (!roleChecked) return;
    if (result) return; // Do not boot camera if a result card is displayed

    let isMounted = true;
    let html5QrcodeScanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      // Delay slightly to ensure DOM element exists after state change
      await new Promise((r) => setTimeout(r, 150));
      const container = document.getElementById(SCANNER_ELEMENT_ID);
      if (!container || !isMounted) return;

      container.innerHTML = "";
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      html5QrcodeScanner = scanner;
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 208, height: 208 } },
          (decodedText) => {
            if (isMounted && !isSubmittingRef.current) {
              submitCheckIn(decodedText);
            }
          },
          () => {}
        );
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof DOMException && (err.name === "AbortError" || err.name === "NotAllowedError")) {
          return;
        }
        setCameraError("Camera unavailable. Check permissions or use manual entry.");
      }
    };

    startScanner();

    return () => {
      isMounted = false;
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
            // Safe fallback
          }
        }
      }
    };
  }, [result, roleChecked]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitCheckIn(qrToken);
  }
  function reset() {
    setResult(null);
    setCameraError(null);
  }

  if (!roleChecked) return null;

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-slate-800 font-sans justify-center">
      <AppSidebar />

      <div className="flex-1 flex justify-center">
        <main className="w-full max-w-[672px] min-h-screen px-[16px] md:px-[32px] py-[24px] md:py-[40px] flex flex-col items-start">
          <div className="w-full max-w-[608px] flex flex-col items-start p-0 shrink-0 mb-[20px]">
            <h1 className="font-chillax font-bold text-[22px] md:text-[24px] leading-[28px] md:leading-[32px] text-[#0E1726]">
              Event Check-In
            </h1>
            <p className="font-['Inter'] font-normal text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] text-[#6B7590] mt-[4px]">
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
              <LiveEventStatusCard />
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
              <LiveEventStatusCard />
            </ResultCard>
          )}

          {result && !result.success && (
            <ResultCard
              onDismiss={reset}
              actionLabel="Try Again"
              footer={
                <a
                  href="tel:+263000000000"
                  className="flex items-center justify-center gap-2 w-full bg-white border border-[rgba(28,46,90,0.1)] text-[#0E1726] rounded-[24px] py-4 text-sm font-semibold hover:bg-slate-50 transition shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)]"
                >
                  <Phone size={15} />
                  Contact Coordination Team
                </a>
              }
            >
              <ResultHeader
                tone="error"
                title="QR Not Recognised"
                subtitle={result.message ?? "Code is invalid or unregistered"}
              />
              <div className="bg-white rounded-[24px] mt-3 p-5 border border-[rgba(28,46,90,0.1)] text-left shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)]">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#0E1726] mb-3">
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  Possible reasons
                </p>
                <ul className="text-sm text-[#6B7590] space-y-2.5 pl-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#FFE2E2] flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6467]" />
                    </span>
                    QR code belongs to a different event
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#FFE2E2] flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6467]" />
                    </span>
                    Registration was not completed
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#FFE2E2] flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6467]" />
                    </span>
                    Code has been altered or corrupted
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#FFE2E2] flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6467]" />
                    </span>
                    Attendee registered under a different email
                  </li>
                </ul>
              </div>
            </ResultCard>
          )}

          <div className={`w-full max-w-[608px] flex-col items-start p-0 ${result ? "hidden" : "flex"}`}>
            <div className="w-full max-w-[608px] bg-[#0E1726] shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] rounded-[24px] flex flex-col items-start overflow-hidden relative shrink-0">
              <div className="relative w-full aspect-square md:h-[608px] shrink-0 bg-[#0E1726] overflow-hidden">
                <div id={SCANNER_ELEMENT_ID} className="absolute inset-0 z-0" />

                <div
                  className="absolute inset-0 pointer-events-none z-10 opacity-[0.07]"
                  style={{
                    background:
                      "radial-gradient(70.71% 70.71% at 50% 50%, rgba(168, 187, 206, 0.8) 0.16%, rgba(0, 0, 0, 0) 0.16%)",
                  }}
                />

                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                  <div className="relative w-[208px] h-[208px]">
                    <div
                      className="absolute -inset-1 rounded-full opacity-[0.44] pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(70.71% 70.71% at 50% 50%, rgba(168, 187, 206, 0.12) 0%, rgba(168, 187, 206, 0) 70%)",
                      }}
                    />
                    <div className="absolute top-0 left-0 w-[32px] h-[32px] border-t-2 border-l-2 border-[#A8BBCE] rounded-tl-[12px]" />
                    <div className="absolute top-0 right-0 w-[32px] h-[32px] border-t-2 border-r-2 border-[#A8BBCE] rounded-tr-[12px]" />
                    <div className="absolute bottom-0 left-0 w-[32px] h-[32px] border-b-2 border-l-2 border-[#A8BBCE] rounded-bl-[12px]" />
                    <div className="absolute bottom-0 right-0 w-[32px] h-[32px] border-b-2 border-r-2 border-[#A8BBCE] rounded-br-[12px]" />
                  </div>
                </div>

                <p className="absolute z-20 pointer-events-none bottom-4 left-0 right-0 font-['Inter'] font-normal text-[12px] leading-[16px] tracking-[0.3px] text-[#A8BBCE]/50 text-center px-4">
                  Position QR code within the frame
                </p>

                {cameraError && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center px-6 text-center bg-[#0E1726]/95">
                    <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                  </div>
                )}
              </div>

              <div className="w-full h-[65px] px-[16px] py-[16px] gap-[12px] flex flex-row items-center border-t border-white/10 shrink-0 bg-[#0E1726]">
                <div className="w-[32px] h-[32px] rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ScanLine size={14} className="text-[#A8BBCE]/70" />
                </div>
                <div className="flex-1 flex flex-col items-start justify-center p-0">
                  <span className="font-['Inter'] font-normal text-[12px] leading-[16px] text-[#A8BBCE]/45 truncate w-full">
                    {loading ? "Checking in…" : "Hold camera steady · Auto-scans in 1–2 seconds"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[608px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-[20px] flex flex-col items-start mt-[16px] shrink-0">
              <span className="w-full font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] mb-[12px] text-left">
                Simulate QR Scan
              </span>
              <div className="w-full flex flex-col items-start gap-[8px]">
                {MOCK_SIMULATIONS.map((item) => (
                  <button
                    key={item.token}
                    type="button"
                    onClick={() => submitCheckIn(item.token)}
                    disabled={loading}
                    className="w-full min-h-[62px] p-[12px] gap-[12px] border border-[rgba(28,46,90,0.1)] rounded-[16px] flex flex-row items-center hover:bg-slate-50 transition text-left shrink-0"
                  >
                    <div className="w-[36px] h-[36px] bg-[#162E55] rounded-[12px] flex items-center justify-center shrink-0">
                      <span className="font-['Inter'] font-bold text-[12px] leading-[16px] text-white">
                        {item.initials}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-start justify-center min-w-0">
                      <span className="font-['Inter'] font-medium text-[14px] leading-[20px] text-[#0E1726] truncate w-full">
                        {item.name}
                      </span>
                      <span className="font-['Consolas'] font-normal text-[10px] leading-[15px] text-[#6B7590] truncate w-full">
                        {item.token}
                      </span>
                    </div>
                    <div className={`px-[10px] py-[4px] gap-[4px] flex flex-row items-center border rounded-[100px] shrink-0 ${item.badgeBg} ${item.badgeBorder}`}>
                      <span className={`w-[6px] h-[6px] rounded-full ${item.dotBg}`} />
                      <span className={`font-['Inter'] font-semibold text-[11px] leading-[16px] tracking-[0.22px] ${item.textColor}`}>
                        {item.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleManualSubmit}
              className="w-full max-w-[608px] bg-white border border-[rgba(28,46,90,0.1)] shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] rounded-[24px] p-[20px] flex flex-col items-start mt-[16px] shrink-0"
            >
              <label className="w-full font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590] text-left">
                Manual Code Entry
              </label>
              <div className="w-full pt-[12px] flex flex-row items-center gap-[8px]">
                <div className="flex-1 h-[52.5px] px-[16px] py-[14px] bg-[#EEF1F5] rounded-[14px] flex items-center">
                  <input
                    type="text"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    placeholder="OAK-2026-XXXX-XXXX"
                    className="w-full bg-transparent font-['Inter'] font-normal text-[15px] leading-[18px] text-[#0E1726] placeholder-[#6B7590] focus:outline-none border-0 p-0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !qrToken.trim()}
                  className="w-[90px] h-[52.5px] bg-[#162E55] shadow-[0px_4px_10px_rgba(28,46,90,0.3)] rounded-[16px] flex items-center justify-center font-chillax font-semibold text-[16px] leading-[24px] text-white hover:bg-[#0f213f] transition disabled:opacity-40 shrink-0"
                >
                  {loading ? "…" : "Check"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function ResultCard({
  onDismiss,
  children,
  actionLabel = "Scan Next Attendee",
  footer,
}: {
  onDismiss: () => void;
  children: React.ReactNode;
  actionLabel?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[608px] flex flex-col gap-3 mb-6">
      {children}
      <button
        type="button"
        onClick={onDismiss}
        className="w-full h-[56px] bg-[#162E55] text-white rounded-[16px] font-chillax font-semibold text-[16px] leading-[24px] shadow-[0px_4px_10px_rgba(28,46,90,0.3)] hover:bg-[#0f213f] transition-all flex items-center justify-center shrink-0 mt-1"
      >
        {actionLabel}
      </button>
      {footer}
    </div>
  );
}

function ResultHeader({ tone, title, subtitle }: { tone: "success" | "warning" | "error"; title: string; subtitle: string }) {
  const isSuccess = tone === "success";
  const isWarning = tone === "warning";
  const gradientClass = isSuccess ? "bg-gradient-to-r from-[#059669] to-[#10B981]" : isWarning ? "bg-gradient-to-r from-[#D97706] to-[#F59E0B]" : "bg-gradient-to-r from-[#DC2626] to-[#EF4444]";
  const label = isSuccess ? "CHECKED IN SUCCESSFULLY" : isWarning ? "ALREADY CHECKED IN" : "CHECK-IN FAILED";

  return (
    <div className={`w-full rounded-[24px] p-5 relative overflow-hidden text-white shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] ${gradientClass}`}>
      <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          {isSuccess || isWarning ? <CheckCircle2 className="w-[30px] h-[30px] text-white" /> : <XCircle className="w-[30px] h-[30px] text-white" />}
        </div>
        <div className="flex flex-col text-left min-w-0">
          <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] text-white/60 uppercase">{label}</span>
          <h2 className="font-chillax font-bold text-[20px] leading-[28px] text-white mt-0.5 truncate">{title}</h2>
          <p className="font-['Inter'] font-normal text-[14px] leading-[20px] text-white/60 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function AttendeeSummary({ attendee }: { attendee: NonNullable<CheckInResult["attendee"]> }) {
  const initials = `${attendee.first_name?.[0] ?? ""}${attendee.last_name?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="w-full bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] p-5 shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] flex flex-col text-left">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 rounded-2xl bg-[#162E55] flex items-center justify-center text-white font-chillax font-bold text-[18px] shrink-0">
          {initials}
        </div>
        <div className="flex flex-col min-w-0 gap-1.5">
          <div>
            <h3 className="font-chillax font-bold text-[18px] leading-[22.5px] text-[#0E1726] truncate">{attendee.first_name} {attendee.last_name}</h3>
            <span className="font-['Inter'] font-normal text-[14px] leading-[20px] text-[#6B7590] truncate">{attendee.organization_name ?? "No Organization"}</span>
          </div>
          {attendee.role && (
            <div className="px-2.5 py-1 bg-[#EEF1F9] border border-[#C5CFDF] rounded-full flex items-center gap-1.5 shrink-0 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C2E5A]" />
              <span className="font-['Inter'] font-semibold text-[11px] leading-[16.5px] tracking-[0.22px] text-[#1C2E5A]">{attendee.role}</span>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 pt-4 mt-4 border-t border-[rgba(28,46,90,0.1)]">
        <div className="bg-[#EEF1F5] rounded-[16px] p-3 flex flex-col">
          <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">Next Session</span>
          <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726] mt-1 truncate">Opening Plenary</span>
        </div>
        <div className="bg-[#EEF1F5] rounded-[16px] p-3 flex flex-col">
          <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">Venue</span>
          <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726] mt-1 truncate">Main Hall A</span>
        </div>
      </div>
    </div>
  );
}

function LiveEventStatusCard() {
  return (
    <div className="w-full bg-white rounded-[24px] border border-[rgba(28,46,90,0.1)] p-5 shadow-[0px_1px_1.5px_rgba(28,46,90,0.05),0px_4px_8px_rgba(28,46,90,0.07)] flex flex-col text-left">
      <span className="font-['Inter'] font-semibold text-[10px] leading-[15px] tracking-[1px] uppercase text-[#6B7590]">
        Live Event Status
      </span>
      <div className="flex items-center gap-2 pt-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BC7D] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BC7D]" />
        </span>
        <span className="font-['Inter'] font-semibold text-[14px] leading-[20px] text-[#0E1726]">Opening Plenary starting at 09:30</span>
      </div>
      <span className="font-['Inter'] font-normal text-[12px] leading-[16px] text-[#6B7590] pt-2">74 of 110 attendees checked in · Main Hall A</span>
      <div className="pt-3">
        <div className="w-full bg-[#E5E8EE] h-[6px] rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#1C2E5A] to-[#2D4A82] h-full w-[67%] rounded-full transition-all duration-500" />
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(iso: string) {
  try {
    const d = new Date(iso);
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
    return `${time} · ${date}`;
  } catch {
    return iso;
  }
}