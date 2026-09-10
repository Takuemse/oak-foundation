import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/superbase/server";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, organization_type, parent_organization_id, website_url, logo_path, description")
      .order("name", { ascending: true });

    if (error) {
      console.error("Partners fetch error:", error);
      return NextResponse.json(
        { success: false, message: "Unable to load partners." },
        { status: 500 }
      );
    }

    const organizations = (data ?? []).map((org) => ({
      ...org,
      logoUrl: org.logo_path
        ? supabase.storage.from("logos").getPublicUrl(org.logo_path).data.publicUrl
        : null,
    }));

    return NextResponse.json({ success: true, organizations });
  } catch (err) {
    console.error("API partners error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 500 }
    );
  }
}