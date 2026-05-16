export function backendBase(): string {
  // Tek kaynak: public env yoksa dev fallback
  const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:4000";
  return base.replace(/\/+$/, "");
}
