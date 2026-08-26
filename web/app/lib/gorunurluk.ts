/**
 * Bölüm görünürlük kodu -> ekranda ne olduğu. TEK KAYNAK.
 *
 * İKİ YERDE AYRI TUTULUYORDU ve ayrışmıştı:
 *
 *   yönetim editörü : <option>V</option> <option>M</option> <option>P</option>
 *                     — çıplak harfler, hiçbir açıklama yok
 *   konu sayfası    : visibility === 'M' ? 'Sadece Hekim' : 'Taslak'
 *
 * Yani operatör `P` seçtiğinde açık sayfada "Taslak" rozeti çıkacağını
 * hiçbir yerden göremiyordu; editör kodun ANLAMINI değil KENDİSİNİ
 * gösteriyordu. Bu, deponun "aynı ilişki iki yerde ayrı tutulursa ayrışır"
 * sınıfının operatör tarafındaki hâli.
 *
 * Davranış DEĞİŞMİYOR: `V` rozetsiz, `M` "Sadece Hekim", `P` ve tanınmayan
 * her değer "Taslak" — konu sayfasının bugünkü eşlemesinin birebir aynısı.
 * (Ölçüldü: içerikte `V` dışında yalnızca 2 bölüm var, ikisi de `M`.)
 *
 * ⚠ ROZET BİR ERİŞİM KISITI DEĞİL, BİR BEYAN. `M` işaretli bölüm herkese
 * gösteriliyor; kod bir süzgeç değil, etiket. Bunu değiştirmek içerik/erişim
 * politikası kararıdır ve ölçümle verilmez — burada yalnızca kaydediliyor.
 */
export type GorunurlukKodu = "V" | "M" | "P";

export const GORUNURLUK: Record<GorunurlukKodu, { rozet: string | null; aciklama: string }> = {
  V: { rozet: null, aciklama: "Herkese açık — rozet yok" },
  M: { rozet: "Sadece Hekim", aciklama: "Rozet: Sadece Hekim (içerik yine herkese görünür)" },
  P: { rozet: "Taslak", aciklama: "Rozet: Taslak (içerik yine herkese görünür)" },
};

/** Tanınmayan değer "Taslak" rozetine düşer — konu sayfasının eski davranışı. */
export function gorunurlukRozeti(kod: string | undefined): string | null {
  if (!kod || kod === "V") return null;
  return (GORUNURLUK as Record<string, { rozet: string | null }>)[kod]?.rozet ?? "Taslak";
}
