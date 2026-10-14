const PRESENTATION_QR = "demo_presentation";

export function publicDemoBase(value: string | undefined) {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:") return null;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1") return null;
  return url.origin;
}

export function presentationUrl(base: string) {
  return `${base}/demo/resa?qr_id=${PRESENTATION_QR}`;
}
