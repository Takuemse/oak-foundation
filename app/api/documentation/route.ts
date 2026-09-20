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

    // Key Takeaways and Resources are convening-wide, not tied to a
    // specific day/post, so they're fetched independently rather than
    // nested under a post the way photos are.
    const { data: keyTakeaways, error: takeawaysError } = await supabase
      .from("key_takeaways")
      .select("id, content, display_order")
      .order("display_order", { ascending: true });

    if (takeawaysError) {
      console.error("Key takeaways error:", takeawaysError);
      return NextResponse.json(
        { success: false, message: "Unable to load key takeaways." },
        { status: 500 }
      );
    }

    const { data: resourceRows, error: resourcesError } = await supabase
      .from("resources")
      .select("id, title, meta, storage_path, display_order")
      .order("display_order", { ascending: true });

    if (resourcesError) {
      console.error("Resources error:", resourcesError);
      return NextResponse.json(
        { success: false, message: "Unable to load resources." },
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

    const resources = (resourceRows ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      meta: r.meta,
      display_order: r.display_order,
      fileUrl: supabase.storage.from("resources").getPublicUrl(r.storage_path).data.publicUrl,
    }));

    return NextResponse.json({
      success: true,
      posts: result,
      keyTakeaways: keyTakeaways ?? [],
      resources,
    });
  } catch (err) {
    console.error("API documentation error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 500 }
    );
  }
}