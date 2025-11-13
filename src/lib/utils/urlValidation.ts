export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();

  // Already has protocol
  if (trimmed.match(/^https?:\/\//i)) {
    return trimmed;
  }

  // Add https by default
  return `https://${trimmed}`;
}
