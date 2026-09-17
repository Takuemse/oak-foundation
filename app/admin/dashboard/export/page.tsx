"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";

type SensitiveAttendee = {
  attendee_id: string;
  first_name: string;
  last_name: string;
  organization_name: string;
  role: string;
  email: string;
  phone: string | null;
  dietary_requirements: string | null;
  accessibility_requirements: string | null;
  travel_requirements: string | null;
};

const ROLE_FILTERS = ["All Roles", "Partner", "OAK Staff", "Coordination Team", "Presenter", "Observer"];

export default function SensitiveExportPage() {
  const [attendees, setAttendees] = useState<SensitiveAttendee[]>([]);
  const [role, setRole] = useState("All Roles");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url =
      role === "All Roles"
        ? "/api/admin/sensitive-export"
        : `/api/admin/sensitive-export?role=${encodeURIComponent(role)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message ?? "Unable to load export.");
          return;
        }
        setAttendees(data.attendees ?? []);
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [role]);

  function downloadCsv() {
    const headers = [
      "First Name",
      "Last Name",
      "Organization",
      "Role",
      "Email",
      "Phone",
      "Dietary Requirements",
      "Accessibility Requirements",
      "Travel Requirements",
    ];
    const rows = attendees.map((a) => [
      a.first_name,
      a.last_name,
      a.organization_name,
      a.role,
      a.email,
      a.phone ?? "",
      a.dietary_requirements ?? "",
      a.accessibility_requirements ?? "",
      a.travel_requirements ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oak-convening-sensitive-export-${role.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-[#0E1726] font-sans justify-center">
      <AdminSidebar />

      <div className="flex-1 flex justify-center">
        <main className="w-full max-w-full md:max-w-[800px] mx-auto min-h-screen px-4 pt-6 pb-10 md:px-8 md:py-10 flex flex-col items-start gap-[16px]">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            <ChevronLeft className="w-4 h-4 text-[#1C2E5A]" />
            <span className="font-['Inter'] font-semibold text-[14px] text-[#1C2E5A] group-hover:underline">
              Dashboard
            </span>
          </Link>

          <div className="w-full flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-chillax font-bold text-[22px] leading-[28px] text-[#0E1726]">
                Sensitive Data Export
              </h1>
              <p className="font-['Inter'] text-[13px] leading-[18px] text-[#6B7590] mt-1 max-w-[480px]">
                Contact and logistics details for catering, accessibility, and
                travel coordination. Visible only to Lead Organizers — never
                shown anywhere else in the app.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={attendees.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#162E55] text-white rounded-[14px] font-['Inter'] font-semibold text-[13px] hover:bg-[#1c3a6b] disabled:opacity-40 transition shrink-0"
            >
              <Download size={15} />
              Download CSV
            </button>
          </div>

          <div className="w-full flex items-center gap-[8px] overflow-x-auto pb-0.5">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`shrink-0 h-[30px] px-[14px] rounded-[12px] font-['Inter'] font-semibold text-[12px] whitespace-nowrap transition ${
                  role === r
                    ? "bg-[#162E55] text-white"
                    : "bg-[#EEF1F5] text-[#6B7590] hover:bg-[#E5E8EE]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-[16px] px-[16px] py-[12px]">
              {error}
            </div>
          )}

          <div className="w-full overflow-x-auto rounded-[24px] border border-[rgba(28,46,90,0.1)] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[rgba(28,46,90,0.1)] text-[#6B7590] font-['Inter'] font-semibold text-[11px] uppercase tracking-[0.5px]">
                  <th className="px-4 py-3 whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Organization</th>
                  <th className="px-4 py-3 whitespace-nowrap">Role</th>
                  <th className="px-4 py-3 whitespace-nowrap">Contact</th>
                  <th className="px-4 py-3 whitespace-nowrap">Dietary</th>
                  <th className="px-4 py-3 whitespace-nowrap">Accessibility</th>
                  <th className="px-4 py-3 whitespace-nowrap">Travel</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#6B7590]">
                      Loading…
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#6B7590]">
                      No attendees match this filter.
                    </td>
                  </tr>
                ) : (
                  attendees.map((a) => (
                    <tr key={a.attendee_id} className="border-b border-[rgba(28,46,90,0.06)] last:border-0">
                      <td className="px-4 py-3 font-medium text-[#0E1726] whitespace-nowrap">
                        {a.first_name} {a.last_name}
                      </td>
                      <td className="px-4 py-3 text-[#6B7590] whitespace-nowrap">{a.organization_name}</td>
                      <td className="px-4 py-3 text-[#6B7590] whitespace-nowrap">{a.role}</td>
                      <td className="px-4 py-3 text-[#6B7590] whitespace-nowrap">
                        {a.email}
                        {a.phone ? ` · ${a.phone}` : ""}
                      </td>
                      <td className="px-4 py-3 text-[#6B7590]">{a.dietary_requirements || "—"}</td>
                      <td className="px-4 py-3 text-[#6B7590]">{a.accessibility_requirements || "—"}</td>
                      <td className="px-4 py-3 text-[#6B7590]">{a.travel_requirements || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}