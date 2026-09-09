"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QrTestPage() {
  const [token, setToken] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 p-8">
      <h1 className="text-lg font-semibold text-slate-800">
        QR Test — Paste a qr_token
      </h1>

      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste qr_token here"
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-80"
      />

      {token && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <QRCodeSVG value={token} size={240} />
        </div>
      )}
    </div>
  );
}