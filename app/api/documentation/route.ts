import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/superbase/server";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: posts, error: postsError } = await supabase
      .from("documentation_posts")
      .select("id, event_date, title, content, published_at")
      .eq("is_published", true)
      .order("event_date", { ascending: true });

    if (postsError) {
      console.error("Documentation posts error:", postsError);
      return NextResponse.json(
        { success: false, message: "Unable to load documentation." },
        { status: 500 }
      );
    }

    const postIds = (posts ?? []).map((p) => p.id);

    const { data: photos, error: photosError } = await supabase
      .from("documentation_photos")
      .select("id, documentation_post_id, storage_path, caption, display_order")
      .in("documentation_post_id", postIds.length > 0 ? postIds : ["00000000-0000-0000-0000-000000000000"])
      .order("display_order", { ascending: true });

    if (photosError) {
      console.error("Documentation photos error:", photosError);
      return NextResponse.json(
        { success: false, message: "Unable to load documentation photos." },
        { status: 500 }
      );
    }

    const result = (posts ?? []).map((post) => ({
      ...post,
      photos: (photos ?? [])
        .filter((ph) => ph.documentation_post_id === post.id)
        .map((ph) => ({
          ...ph,
          photoUrl: supabase.storage.from("photos").getPublicUrl(ph.storage_path).data.publicUrl,
        })),
    }));

    return NextResponse.json({ success: true, posts: result });
  } catch (err) {
    console.error("API documentation error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 500 }
    );
  }
}