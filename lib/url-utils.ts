export function getGoogleDriveFileId(url: string) {
  const trimmed = url.trim();
  if (!trimmed.includes("drive.google.com")) return null;

  const pathMatch = trimmed.match(/\/(?:file\/d|document\/d|presentation\/d)\/([^/?#]+)/);
  if (pathMatch?.[1]) return pathMatch[1];

  try {
    const parsed = new URL(trimmed);
    return parsed.searchParams.get("id");
  } catch {
    return null;
  }
}

export function normalizePosterUrl(url: string | null | undefined) {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "";

  const driveId = getGoogleDriveFileId(trimmed);
  if (!driveId) return trimmed;

  return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
}
