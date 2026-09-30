/**
 * SANKALP frontend configuration.
 *
 * Development:
 *   VITE_API_URL can remain empty.
 *   Vite proxies /api to http://localhost:1710.
 *
 * Production:
 *   Set:
 *
 *   VITE_API_URL=https://your-backend.onrender.com
 *
 * before building the frontend.
 */

const raw = (
  import.meta.env.VITE_API_URL || ""
)
  .trim()
  .replace(/\/+$/, "");

if (import.meta.env.PROD && !raw) {
  console.warn(
    "[SANKALP] VITE_API_URL is not configured. " +
      "The production frontend may not reach the Express backend."
  );
}

export const API_BASE = raw;

export const SOCKET_URL =
  raw ||
  (import.meta.env.DEV
    ? "http://localhost:1710"
    : "");

export const assetUrl = (url) => {
  if (!url) return url;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.startsWith("/uploads")) {
    return `${API_BASE}${url}`;
  }

  return url;
};