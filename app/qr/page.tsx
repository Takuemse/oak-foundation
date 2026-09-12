"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import AppSidebar from "@/app/components/AppSidebar";

type QrAttendee = {
  attendee_id: string;
  first_name: string;
  last_name: string;
  organization_name: string | null;
  role: string | null;
  qr_token: string;
  registered_at: string;
};

export default function QrCodePage() {
  const [attendee, setAttendee] = useState<QrAttendee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("oak_qr_token");
    if (!savedToken) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    fetch(`/api/qr?token=${encodeURIComponent(savedToken)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAttendee(data.attendee);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleEmailLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/qr?email=${encodeURIComponent(emailInput)}`);
      const data = await res.json();
      if (!data.success) {
        setLookupError(data.message ?? "No Partner registration found for that email.");
        return;
      }
      localStorage.setItem("oak_qr_token", data.attendee.qr_token);
      setAttendee(data.attendee);
      setNotFound(false);
    } catch {
      setLookupError("Network error. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  }

  function handleDownload() {
    const originalCanvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!originalCanvas || !attendee) return;

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
    link.download = `oak-entry-pass-${attendee.first_name.toLowerCase()}-${attendee.last_name.toLowerCase()}.png`;
    link.click();
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex text-[#0E1726] font-sans justify-center">
      <AppSidebar />
      <div className="flex-1 flex justify-center">
        <main className="w-full max-w-[672px] min-h-screen px-4 md:px-8 py-6 md:py-10 flex flex-col gap-4">
          <div className="w-full flex flex-col items-start">
            <h1 className="font-['Chillax'] font-bold text-[24px] leading-[32px] text-[#0E1726]">
              My QR Code
            </h1>
            <p className="font-['Inter'] text-[14px] leading-[20px] text-[#6B7590] mt-[2px]">
              Your entry pass for OAK Partner Convening 2026
            </p>
          </div>

          {loading ? (
            <div className="w-full py-16 text-center font-['Inter'] text-[14px] text-[#6B7590]">
              Loading your entry pass…
            </div>
          ) : attendee ? (
            <>
              <div className="w-full bg-white rounded-[24px] p-6 sm:p-8 shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] border border-[rgba(28,46,90,0.1)] flex flex-col items-center text-center">
                <span className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase mb-6">
                  Your Entry Pass
                </span>
                <div
                  ref={canvasWrapperRef}
                  className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-5"
                >
                  <QRCodeCanvas
                    value={attendee.qr_token}
                    size={180}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="H"
                    marginSize={4}
                  />
                </div>
                <span className="font-mono font-medium text-[14px] leading-[18px] text-[#6B7590] tracking-wider uppercase mb-1">
                  {attendee.qr_token}
                </span>
                <span className="font-['Inter'] text-[12px] leading-[16px] text-[#A0AEC0]">
                  Present at event entrance for check-in
                </span>
              </div>

              <div className="w-full bg-white rounded-[24px] p-6 shadow-[0px_1px_3px_rgba(28,46,90,0.05),0px_4px_16px_rgba(28,46,90,0.07)] border border-[rgba(28,46,90,0.1)] flex flex-col gap-4">
                <span className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.3px] text-[#6B7590] uppercase">
                  Registration Details
                </span>
                <div className="flex flex-col gap-3">
                  <DetailRow label="Name" value={`${attendee.first_name} ${attendee.last_name}`} />
                  <DetailRow label="Organisation" value={attendee.organization_name || "—"} />
                  <DetailRow label="Role" value={attendee.role || "—"} />
                  <DetailRow label="Event Dates" value="9–11 November 2026" />
                  <DetailRow label="Location" value="Harare, Zimbabwe" />
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full h-[52px] text-white rounded-[16px] font-['Chillax'] font-semibold text-[15px] leading-[22px] transition duration-150 flex items-center justify-center gap-2 shadow-[0px_4px_20px_rgba(28,46,90,0.25)] hover:opacity-95"
                style={{ background: "linear-gradient(135deg, #1C2E5A 0%, #2D4A82 100%)" }}
              >
                Download QR Code
              </button>
            </>
          ) : (
            <div className="w-full bg-white rounded-[24px] p-6 shadow-[0px_1px_3px_rgba(28,46,90,0.05)] border border-[rgba(28,46,90,0.1)] flex flex-col gap-4">
              <p className="font-['Inter'] text-[14px] text-[#6B7590]">
                We couldn&apos;t find a saved pass on this device. Enter the email you registered
                with to retrieve it.
              </p>
              <form onSubmit={handleEmailLookup} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="you@organisation.org"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full h-[48px] rounded-[14px] bg-[#EEF1F5] px-4 font-['Inter'] text-[14px] text-[#0E1726] placeholder-[#6B7590] focus:outline-none focus:ring-2 focus:ring-[#162E55]/20 border-0"
                />
                {lookupError && (
                  <p className="text-red-600 text-[13px] font-['Inter']">{lookupError}</p>
                )}
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full h-[48px] bg-[#162E55] text-white rounded-[14px] font-['Inter'] font-semibold text-[14px] disabled:opacity-50"
                >
                  {lookupLoading ? "Looking up…" : "Find my QR Code"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 last:pb-0 gap-2">
      <span className="font-['Inter'] font-normal text-[13px] leading-[18px] text-[#6B7590] shrink-0">
        {label}
      </span>
      <span className="font-['Inter'] font-medium text-[13px] leading-[18px] text-[#0E1726] text-right truncate">
        {value}
      </span>
    </div>
  );
}