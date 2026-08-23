import type { PlanType } from "@/app/components/PlanBadge";

/**
 * OTURUMDAKİ PLANI OKUMANIN TEK YERİ.
 *
 * Bu yardımcı, ölçülmüş bir kusurdan doğdu: `/tr/premium` ve `/profile`
 * sayfalarının İKİSİ de planı SABİT yazıyordu (`const plan = "free"`,
 * `useState<PlanType>("free")`). İkisi de `useSession()` çağırıyor ama
 * yalnızca `status` alıyor, kullanıcının gerçek planını hiç okumuyordu —
 * oysa `auth.config.ts` planı token'a ve oturuma yazıyor.
 *
 * Sonuç: ÖDEME YAPMIŞ bir premium üye, premium'un giriş sayfasında "Free"
 * rozeti ve yedi kilitli kart görüyordu.
 *
 * Plan okuma iki yerde ayrı ayrı yazılsaydı yine ayrışırdı; bu yüzden tek
 * kaynak. Şemadaki değerler (`lib/models/User.ts`): free | member | premium.
 */

/** Kart/kapı rolü: V ziyaretçi, M üye, P premium. */
export type Rol = "V" | "M" | "P";

function ham(oturumKullanicisi: unknown): string {
  const u = oturumKullanicisi as { plan?: unknown } | null | undefined;
  return typeof u?.plan === "string" ? u.plan.trim().toLowerCase() : "";
}

/**
 * Rozette gösterilecek plan. Tanınmayan her değer `free`e düşer —
 * bilinmeyen bir plana yüksek rozet vermek, kullanıcıya sahip olmadığı
 * bir erişimi VAAT ETMEK olurdu.
 */
export function planCoz(oturumKullanicisi: unknown): PlanType {
  switch (ham(oturumKullanicisi)) {
    case "pro":     return "pro";
    case "premium": return "premium";
    case "member":  return "member";
    default:        return "free";
  }
}

/** Kapı rolü. Aynı sebeple tanınmayan değer en dar role düşer. */
export function planRolu(oturumKullanicisi: unknown): Rol {
  switch (ham(oturumKullanicisi)) {
    case "pro":
    case "premium": return "P";
    case "member":  return "M";
    default:        return "V";
  }
}
