import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-xl border border-slate-200 p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-800 mb-1">You're registered</h1>
        <p className="text-sm text-slate-400 mb-6">Explore the event resources below</p>
        <div className="space-y-2">
          <Link href="/programme" className="block bg-[#0f1e3d] text-white rounded-lg py-2.5 text-sm font-medium">Programme</Link>
          <Link href="/partners" className="block border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600">Partners</Link>
        </div>
      </div>
    </div>
  );
}