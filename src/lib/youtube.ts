// Normalize any YouTube URL to an embed URL. Returns null when invalid.
export function toYouTubeEmbed(url: string | undefined | null): string | null {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") {
      id = u.pathname.replace(/^\//, "").split("/")[0];
    } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v") ?? "";
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] ?? "";
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] ?? "";
      } else if (u.pathname.startsWith("/v/")) {
        id = u.pathname.split("/")[2] ?? "";
      }
    }
    if (!id || !/^[A-Za-z0-9_-]{6,}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  } catch {
    return null;
  }
}
