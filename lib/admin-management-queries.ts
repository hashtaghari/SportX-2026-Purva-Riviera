import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizePosterUrl } from "@/lib/url-utils";

export type AdminHouseOption = {
  id: string;
  name: string;
  color: string;
};

export type AdminBlock = {
  id: string;
  name: string;
  displayOrder: number;
  houseId: string | null;
};

export type AdminEvent = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  rules: string;
  rulebookUrl: string;
  posterUrl: string;
  registrationLink: string;
  winnerDetails: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  status: "upcoming" | "ongoing" | "completed" | "archived";
};

export type AdminEventScore = {
  eventId: string;
  houseId: string;
  points: number;
  position: number | null;
  resultLabel: string;
};

export type AdminGallerySection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  imageCount: number;
};

export type AdminGalleryImage = {
  id: string;
  sectionId: string | null;
  src: string;
  storagePath: string;
  altText: string;
  caption: string;
  featured: boolean;
  createdAt: string;
};

export type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publishedAt: string;
  expiresAt: string;
};

export async function getAdminBlocksData(): Promise<{
  houses: AdminHouseOption[];
  blocks: AdminBlock[];
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { houses: [], blocks: [] };

  const [{ data: houses }, { data: blocks }] = await Promise.all([
    supabase.from("houses").select("id, name, color").order("name"),
    supabase.from("blocks").select("id, name, display_order, house_id").order("display_order"),
  ]);

  return {
    houses: (houses ?? []).map((house) => ({
      id: house.id,
      name: house.name,
      color: house.color,
    })),
    blocks: (blocks ?? []).map((block) => ({
      id: block.id,
      name: block.name,
      displayOrder: block.display_order,
      houseId: block.house_id,
    })),
  };
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, slug, name, category, description, rules, rulebook_url, poster_url, registration_link, winner_details, venue, starts_at, ends_at, status",
    )
    .order("starts_at", { ascending: true });

  return (events ?? []).map((event) => ({
      id: event.id,
      slug: event.slug,
      name: event.name,
      category: event.category,
      description: event.description ?? "",
      rules: event.rules ?? "",
      rulebookUrl: event.rulebook_url ?? "",
      posterUrl: normalizePosterUrl(event.poster_url),
      registrationLink: event.registration_link ?? "",
      winnerDetails: event.winner_details ?? "",
      venue: event.venue,
      startsAt: event.starts_at,
      endsAt: event.ends_at ?? "",
      status: event.status,
    }));
}

export async function getAdminEventScores(): Promise<AdminEventScore[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("event_scores")
    .select("event_id, house_id, points, position, result_label");

  return (data ?? []).map((score) => ({
    eventId: score.event_id,
    houseId: score.house_id,
    points: score.points,
    position: score.position,
    resultLabel: score.result_label ?? "",
  }));
}

export async function getAdminGalleryData(): Promise<{
  sections: AdminGallerySection[];
  images: AdminGalleryImage[];
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { sections: [], images: [] };

  const [{ data: sections }, { data: images }] = await Promise.all([
    supabase
      .from("gallery_sections")
      .select("id, name, slug, description, display_order")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("gallery_images")
      .select("id, section_id, storage_bucket, storage_path, alt_text, caption, featured, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const mappedImages = (images ?? []).map((image) => {
    const { data: publicUrl } = supabase.storage
      .from(String(image.storage_bucket ?? "sportx-gallery"))
      .getPublicUrl(String(image.storage_path));

    return {
      id: String(image.id),
      sectionId: image.section_id ? String(image.section_id) : null,
      src: publicUrl.publicUrl,
      storagePath: String(image.storage_path),
      altText: String(image.alt_text ?? "SportX gallery image"),
      caption: String(image.caption ?? ""),
      featured: Boolean(image.featured),
      createdAt: String(image.created_at),
    };
  });

  return {
    sections: (sections ?? []).map((section) => ({
      id: String(section.id),
      name: String(section.name),
      slug: String(section.slug),
      description: String(section.description ?? ""),
      displayOrder: Number(section.display_order ?? 0),
      imageCount: mappedImages.filter((image) => image.sectionId === String(section.id)).length,
    })),
    images: mappedImages,
  };
}

export async function getAdminAnnouncements(): Promise<AdminAnnouncement[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, pinned, published_at, expires_at")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false });

  return (data ?? []).map((announcement) => ({
    id: String(announcement.id),
    title: String(announcement.title),
    body: String(announcement.body),
    pinned: Boolean(announcement.pinned),
    publishedAt: announcement.published_at ? String(announcement.published_at) : "",
    expiresAt: announcement.expires_at ? String(announcement.expires_at) : "",
  }));
}
