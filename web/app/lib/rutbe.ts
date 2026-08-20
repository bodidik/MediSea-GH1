/**
 * XP'den rütbe — profil ve liderlik tablosunun TEK kaynağı.
 *
 * İkisi ayrı yerlerde hesaplıyordu ve ayrışıyorlardı: profil rütbeyi gerçek
 * XP'den türetiyor, liderlik tablosu ise kullanıcının satırına 'Gemi Kaptanı'
 * diye sabit yazıyordu. 12.000 XP'li bir kullanıcı profilde "Büyük Amiral",
 * liderlikte "Gemi Kaptanı" görüyordu — aynı şeyi gösteren iki yüzeyin
 * ayrışması bu projede tekrar eden bir kusur sınıfı (satış sayfası "362 soru"
 * derken panonun "352" demesi gibi).
 *
 * Eşikler liderlik tablosundaki tanıtım ünvanlarıyla aynı merdiveni izler;
 * o listedeki XP değerleri (12500, 10200, 8900, 7500, 6200, 4800) bu
 * basamakların hemen üstüne düşüyor.
 */
export function rutbe(xp: number): string {
  if (xp >= 12000) return "Büyük Amiral";
  if (xp >= 10000) return "Koramiral";
  if (xp >= 8500) return "Tümamiral";
  if (xp >= 7000) return "Tuğamiral";
  if (xp >= 6000) return "Kıdemli Albay";
  if (xp >= 4500) return "Yarbay";
  return "Gemi Kaptanı";
}
