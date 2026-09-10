import Link from "next/link";
import { Calendar, Globe } from "lucide-react";
import AppSidebar from "@/app/components/AppSidebar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-xl mx-auto w-full">
        <div className="bg-[#0f1e3d] text-white rounded-xl px-5 py-4 mb-6">
          <h1 className="text-lg font-semibold">You&apos;re registered</h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Explore the event resources below
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/programme"
            className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition"
          >
            <span className="w-10 h-10 rounded-xl bg-[#0f1e3d] text-white flex items-center justify-center flex-shrink-0">
              <Calendar size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-800">Programme</span>
              <span className="block text-xs text-slate-400 mt-0.5">
                View the full event schedule
              </span>
            </span>
          </Link>

          <Link
            href="/partners"
            className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition"
          >
            <span className="w-10 h-10 rounded-xl bg-[#0f1e3d] text-white flex items-center justify-center flex-shrink-0">
              <Globe size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-800">Partners</span>
              <span className="block text-xs text-slate-400 mt-0.5">
                Browse the partner directory
              </span>
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
